# from fastapi import FastAPI, UploadFile, File
# import uvicorn
# import numpy as np
# from PIL import Image
# from io import BytesIO
# import tensorflow as tf
# import json
# from fastapi.middleware.cors import CORSMiddleware
#
# app = FastAPI()
# origins = ["http://localhost:3000"]
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# # load saved tensorflow model
# MODEL = tf.keras.models.load_model("../models/potato_disease.keras")
# with open("../training/class_names.json") as f:
#     CLASS_NAMES = json.load(f)
# print(CLASS_NAMES)
# def read_file_as_image(data) ->np.ndarray:
#     image = Image.open(BytesIO(data)).convert("RGB")
#     image = image.resize((256, 256))
#     image = np.array(image) / 255.0
#     return image
#
# @app.post("/predict")
# async def predict(
#         file: UploadFile = File(...)  # upload file is a datatype
# ):
#     # convert file into numpy array
#      image = read_file_as_image(await file.read())
#      image_batch = np.expand_dims(image,0).astype(np.float32)
#      prediction = MODEL.predict(image_batch)
#      print(prediction)
#      predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
#      confidence=100*(np.max(prediction[0]))
#      return{
#          'class_name':predicted_class,
#          'confidence':float(confidence)
#      }
#      print("Image shape:", image.shape)
#      print("Image min/max:", image.min(), image.max())
#
#
# if __name__ == "__main__":
#     uvicorn.run(app, host='localhost', port=8000)


from fastapi import FastAPI, UploadFile, File
import uvicorn
import numpy as np
from PIL import Image
from io import BytesIO
import tensorflow as tf
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load saved model (includes preprocessing layers)
MODEL = tf.keras.models.load_model("../models/potato_disease_v1.keras")
with open("../training/class_names.json") as f:
    CLASS_NAMES = json.load(f)
print("Loaded classes:", CLASS_NAMES)

def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((256, 256))
    image = np.array(image)  # **DO NOT divide by 255**, model already has rescaling
    image = np.expand_dims(image, axis=0)  # add batch dimension
    return tf.convert_to_tensor(image, dtype=tf.float32)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        prediction = MODEL.predict(image)
        predicted_class = CLASS_NAMES[int(np.argmax(prediction[0]))]
        confidence = float(np.max(prediction[0]) * 100)
        return {
            "class_name": predicted_class,
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
