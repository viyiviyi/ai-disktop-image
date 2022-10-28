- 执行 node index.js 或者 python index.py 更换壁纸
- 可以配置为windows计划任务，操作是：启动pythonw 参数是 index.py 起始位置是index.py文件所在目录
  
- 需要python环境
- 暂时只有windows的设置壁纸功能，如果要加其他平台的，需要在 app/utils/setBg.py文件内写兼容

# config 文件说明
``` javascript
{
  "server-type-all": [ // 接口列表
    {
      "url": "/generate-stream", // api地址 当不以http开台且配置ngrok的api token后就可以自动查找ngrok当前的代理地址，https://ngrok.com/
      "name": "naifu_k_euler_ancestral_ngrok", // 接口名称
      "isMagic": true, // 开启魔法书，当开启时会随机一个魔法书加入tag列表  魔法书文件目录 app/data/元素法典.json
      "apiType": "naifu", // 接口类型 支持 naifu 和 stable-diffusion
      "ngrok": { // ngrok 配置
        "enadle": true,
        "token": "2GZ2Qu3eF16h1plsPeS6jpYRpPg_7ejEiaLRy8uKdcfgKiQZL"
      },
      "defaultPrompts": [ // 默认的tag和反向tag，
        "masterpiece, best quality",
        "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"
      ],
      "option": { // 一些参数配置
        "prompts": "",// 正面tag
        "unprompts": "",// 反面tag
        "seed": -1,// 种子数 -1表示随机
        "width": 1024, // 图片宽
        "height": 576, // 图片高 不用设置太高，可以配合超分辨率功能放大
        "scale": 12, // teg相关程度 (我也不知道是不是这个意思，是从sd的翻译里面来的)
        "sampler": "k_euler_ancestral", // 采样方式 k_euler_ancestral/k_euler （naifu和sd的描述不一样，暂时只写了两种方式的名称映射，写别的会认不出来导致报错）
        "steps": 28, // 步数 （一般情况下步数高质量会更好，）
      }
    },
    {
      "url": "http://localhost:6969/generate-stream",
      "name": "naifu_k_euler_ancestral_local",
      "isMagic": true,
      "apiType": "naifu",
      "defaultPrompts": [
        "masterpiece, best quality",
        "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"
      ],
      "option": {
        "sampler": "k_euler_ancestral"
      }
    },
    {
      "url": "http://127.0.0.1:7860/api/predict",
      "name": "stable-diffusion_local",
      "isMagic": true,
      "apiType": "stable-diffusion",
      "defaultPrompts": [
        "masterpiece, best quality",
        "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"
      ],
      "option": {
        "sampler": "k_euler_ancestral"
      }
    }
  ],
  "server-type": [ // 启用的api ，会按顺序调用直到获取到图片
    "naifu_k_euler_ancestral_ngrok",
    "stable-diffusion_local",
    "naifu_k_euler_ancestral_local"
  ],
  "Super-Resolution": "ncnn -i $input -o $output -s 2" // 超分辨功能的命令行
}
```