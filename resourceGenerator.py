import hashlib
import sys
import os
import datetime
import time
import zipfile

def md5_for_file(path, block_size=256*128, hr=False):
    '''
    Block size directly depends on the block size of your filesystem
    to avoid performances issues
    Here I have blocks of 4096 octets (Default NTFS)
    '''
    md5 = hashlib.md5()
    with open(path,'rb') as f: 
        for chunk in iter(lambda: f.read(block_size), b''): 
             md5.update(chunk)
    if hr:
        return md5.hexdigest()
    return md5.digest()

def test_md5():
   real_md5 = md5_for_file(sys.argv[1], 256*128, True)
   expected_md5 = "f4f1e2efbab833e5e9c27956010c33f3"
   print real_md5

def test_generator(rootpaths, manifestname):   
   try:
       import zlib
       compression = zipfile.ZIP_DEFLATED
   except:
       print "using zipfile.ZIP_STORED instead of ZIP_DEFLATED"
       compression = zipfile.ZIP_STORED

   STAMPFORMAT="%Y%m%d%H%M%S"
   filelist = []
   print 'start to calculate md5 at ' + time.strftime(STAMPFORMAT,time.localtime())
   for adir in rootpaths: 
       walk_dir(os.path.join(adir), filelist, True)
   
   print 'end to calculate md5 at ' + time.strftime(STAMPFORMAT,time.localtime())
   version = time.strftime(STAMPFORMAT,time.localtime())
   print 'start to write manifest at ' + time.strftime(STAMPFORMAT,time.localtime()) 
   fileinfo = open(manifestname+'.manifest','w')
   fileinfo.write('{')
   fileinfo.write('"manifestVersion":{"version":"' + version + '"},')
   index = 0
   for item in filelist:
        index = index + 1
        if index == 1:
            fileinfo.write(item)
        else:
            fileinfo.write(',' + item)
   fileinfo.write('}')
   fileinfo.close();

   # fileini = open(manifestname + '.ini','w')
   # fileini.write('[manifest]\n');
   # fileini.write(manifestname + '.manifest=');
   # fileini.write(version);
   # fileini.close();
   # print 'end to write manifest at ' + time.strftime(STAMPFORMAT,time.localtime()) 

   zipfilename = manifestname + '.manifest.zip'
   with zipfile.ZipFile(zipfilename, 'w') as manifestzip:
       manifestzip.write(manifestname + '.manifest', compress_type=compression);
       manifestzip.close();

def walk_dir(dir,filelist,topdown=True):
    for root, dirs, files in os.walk(dir, topdown):
        for name in files:
            #print name
            if name.startswith('.'):
                continue
            relative_path = os.path.join(root,name)
            #print relative_path
            filelist.append('"' + relative_path + '":{"md5":"' + md5_for_file(relative_path,256*128,True) + '","size":"' + str(os.path.getsize(relative_path)) + '"}')
        for name in dirs:
            j=0

def usage():
    print """
    usage:  python resourceGenerator.py DIR|DIRECTORY_LIST_FILE TYPE
    DIR     absolute path to root resource folder
    TYPE    appframe, config, dynamic"""

if __name__ == "__main__":
    if len(sys.argv) <> 3:
        usage();
        exit();
    else:
        manifestname = 'default'
        if (sys.argv[2]=='appframe'):
            manifestname = 'appframe'
        elif (sys.argv[2]=='config'):
            manifestname = 'config'
        elif (sys.argv[2]=='dynamic'):
            manifestname = 'dynamic'
        else:
            usage();
            exit();
    directoryArray = []
    if os.path.isdir(sys.argv[1]):
        directoryArray = [sys.argv[1]]  
    else:
        f = open(sys.argv[1])
        directoryArrayRaw = f.readlines()
        f.close()  
        for line in directoryArrayRaw:
            directoryArray.append(line.strip())
    test_generator(directoryArray, manifestname)
