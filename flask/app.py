import re
from flask import Flask, request
import torch
import os
import torchvision.transforms as transforms
from PIL import Image
from efficientnet_pytorch import EfficientNet

app = Flask(__name__)

model = EfficientNet.from_pretrained('efficientnet-b0', num_classes=9)
model.load_state_dict(torch.load(
    './weights/fish_model_b0.pt', map_location='cpu'))
model.eval()

def transform_image(infile):
    input_transforms = [transforms.Resize((224, 224)),  # 이미지 크기 조정
                        # transforms.ToPILImage(), #csv파일 형식으로 데이터를 받을 경우 PIL이미지로 변환
                        transforms.ToTensor(),  # 데이터를 텐서로 변환
                        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])]  # 정규화
    my_transforms = transforms.Compose(input_transforms)
    image = Image.open(infile).convert('RGB');
    timg = my_transforms(image)
    timg.unsqueeze_(0)
    return timg

def calc(species, length):
    print(species, length)
    if species == '고등어':
        weight = round(0.0044 * (int(length) ** 3.362), 2) 
        
    if species == '전갱이':
        weight = round(0.0236 * (int(length) ** 2.8362), 2)
        
    if species == '갈치':
        weight = round(0.0307 * (int(length) ** 2.7828), 2)
        
    if species == '조기':
        weight = round(0.0049 * (int(length) ** 3.2153), 2)
        
    if species == '삼치':
        weight = round(6.577 * (int(length) ** 3.002), 2)
    
    return weight


@app.route('/', methods=['POST'])
def test():
    species = ['고등어', '전갱이', '갈치', '조기', '오징어', '삼치', '참홍어', '붉은대게', '꽃게']
    img_folder = '../files/original/'
    img_name = request.json['content']
    s = os.path.splitext(img_name)
    path = img_folder + img_name
    
    length_split = (s[0].split('_'))[3]

    input_tensor = transform_image(path)
    output = model(input_tensor)
    result = output[0].tolist()

    result_max_idx = result.index(max(result))
    
    print(species[result_max_idx])

    weight = calc(species[result_max_idx], length_split)

    img_rename = s[0] + '_' + str(weight) + '_' + species[result_max_idx] + s[1]
    src = img_folder+img_name
    dst = img_folder + img_rename

    os.rename(src, dst)

    # 변경된 이름 return
    return {'img_rename': img_rename, 'weight': weight, 'species':species[result_max_idx]}


if __name__ == '__main__':
    app.run()
