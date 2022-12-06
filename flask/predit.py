# Libaray
from PIL import Image
import ttach as tta
import torch
import torch.nn as nn
from torchvision import transforms
from torch.cuda.amp import autocast
from efficientnet_pytorch import EfficientNet
import numpy as np
from easydict import EasyDict
from flask import Flask, request
import os

app = Flask(__name__)

args = EasyDict({'encoder_name':'efficientnet-b0',
                 'num_classes':10,
                 'image_path' : '',
                 'model_path' : './weights/best_model.pth'
                })

#Cuda Setting
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 이미지 Transform
def get_train_augmentation(img_size, ver):
    if ver==1:
        transform = transforms.Compose([
            transforms.ToTensor(), 
            transforms.Resize((img_size, img_size)),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
                ])      
    return transform

# NetWork
class Network(nn.Module):
    def __init__(self, args):
        super().__init__()
        self.encoder = EfficientNet.from_pretrained(args.encoder_name,num_classes = args.num_classes )
        
    def forward(self, x):
        x = self.encoder(x)
        return x

def predict(args):
    #이미지 transform

    #image Load
    image = np.array(Image.open(args.image_path).convert('RGB'))
    transform = get_train_augmentation(img_size = 312, ver = 1)
    image = transform(Image.fromarray(image)) #적용
    image = image.unsqueeze(0)
    
    #attach 적용_예측에 사용될  transform
    tta_transform = tta.Compose([
        tta.Rotate90(angles=[60, 150, 240, 270]),
    ])

    #Model Load
    model = Network(args).to(device)
    model.load_state_dict(torch.load(args.model_path, map_location=device)['state_dict'])

    #model에 tta적용
    model = tta.ClassificationTTAWrapper(model, tta_transform).to(device)

    #model에 예측설정
    model.eval()

    output = [] #결과 찍히는 변수
    pred = [] # tta 하기전 결과

    with torch.no_grad():
        with autocast():
            #텐서 데이터로 바꿔줌
            images = torch.tensor(image, dtype= torch.float32, device=device).clone().detach()
            #예측
            preds = model(images)
            pred.extend(preds)
            #tta로 변환된 예측결과에 대해 softmax를 취한다.(소프트 앙상블)
            output.extend(torch.tensor(torch.argmax(preds, dim=1), dtype=torch.int32).cpu().numpy())

    return output

#고등어
def calc_mackerel(length):
    return round(0.0044 * (length ** 3.362), 2)

#전갱이
def calc_horse_mackerel(length):
    return round(0.0236 * (length ** 2.8362), 2)

#갈치
def calc_cutlessfish(length):
    return round(0.0307 * (length ** 2.7828), 2)

#조기
def calc_croaker(length):
    return round(0.0049 * (length ** 3.2153), 2)

#오징어
def calc_squid(length):
    return round(0.0248 * (length ** 2.9961), 2)

#삼치
def calc_spanish_mackerel(length):
    return round(6.577 * (length ** 3.002), 2)

#참홍어
def calc_skate(length):
    return round(0.0063 * (length ** 3.3992), 2)

#붉은대게
def calc_red_snow_crab(length):
    return round(0.0011 * (length ** 2.79), 2)

calc_weight = {
    'mackerel': calc_mackerel,
    'horse_mackerel': calc_horse_mackerel,
    'cutlessfish': calc_cutlessfish,
    'croaker': calc_croaker,
    'squid': calc_squid,
    'spanish_mackerel': calc_spanish_mackerel,
    'skate': calc_skate,
    'red_snow_crab': calc_red_snow_crab
}

@app.route('/', methods=['POST'])
def predictFish():
    # '고등어', '전갱이', '갈치', '조기', '오징어', '삼치', '참홍어', '붉은대게', '꽃게', '없음'
    species = ['mackerel', 'horse_mackerel', 'cutlessfish', 'croaker', 'squid', 'spanish_mackerel', 'skate', 'red_snow_crab', 'nothing']

    img_folder = request.json['content']['path']
    img_name = request.json['content']['original_file_name']

    # s = os.path.splitext(img_name)
    path = img_folder + img_name

    # name_split = s[0].split('_')
    # length_split = name_split[3]
    # height_split = name_split[4]

    # strlength = list(str(length_split))
    # strheight = list(str(height_split))

    # strlength.insert(len(strlength)-1, '.')
    # strheight.insert(len(strheight)-1, '.')

    # lengthResult = ''.join(strlength)
    # heightResult = ''.join(strheight)

    # name_split[3] = lengthResult
    # name_split[4] = heightResult

    # test = '_'.join(name_split)

    args.image_path = path

    result = predict(args)

    if result[0] == 9:
        return {'status': 0}
    else :
        # print(lengthResult)
        # weight = calc_weight[species[result[0]]](float(lengthResult))

        # img_rename = test + '_' + str(weight) + '_' + \
        #     species[result[0]] + s[1]
        
        # src = img_folder + img_name
        # dst = img_folder + img_rename

        # os.rename(src, dst)
        
        # 변경된 이름 return
        # return {'img_rename': img_rename, 'weight': weight, 'species': species[result[0]]}
        return {'species': species[result[0]]}

if __name__ == '__main__':
    app.run()




