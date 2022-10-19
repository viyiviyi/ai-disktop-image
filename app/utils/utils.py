import os
import config

count = 3
while count:
    try:
        import win32gui   #引入需要的模块
        break
    except:
        print ('win32gui模块未安装,现在准备开始安装')
        os.system('pip install pywin32')
        count -= 1
        continue

def srImage():
  os.system(config.config['Super-Resolution'])

def setWallpaper(imgPath):
    print(imgPath)
    win32gui.SystemParametersInfo(20, imgPath, 3)
