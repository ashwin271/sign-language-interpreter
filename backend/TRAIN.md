# Info on Training

## Cuda 

Cuda version should be above 12.x

Check Cuda version:

```shell
nvidia-smi
```

## CuDNN

CuDNN version should be `9.3`. Only this version is supported in the tensorflow version `2.19.0`. 

Check CuDNN version:

```shell
dpkg -l | grep -i cudnn
```

## Training

This should be executed before running the training script, or else it wont work.

```shell
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
```

Training script

```shell
python src/train_gesture.py
```