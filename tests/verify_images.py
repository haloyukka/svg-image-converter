from PIL import Image
import zipfile
from pathlib import Path
root=Path(__file__).parent/'generated'
for f in ['test.bmp','test.tiff','test.gif','large.gif']:
    im=Image.open(root/f).convert('RGBA')
    im.load()
    assert im.getpixel((0,0))==(255,0,0,255),f
    if f in ['test.tiff','test.gif']:
        assert im.getpixel((1,1))[3]==0,f
    print(f,im.size,'decoded OK')
with zipfile.ZipFile(root/'test.zip') as z:
    assert z.testzip() is None
    assert z.read('日本語/red.txt')==b'red'
    print('ZIP Unicode and CRC OK')
