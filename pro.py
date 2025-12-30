# Please install OpenAI SDK first: `pip3 install openai`
import os
from openai import OpenAI


OPENAI_API_KEY='sk-64333889186b4348b2d3835b2bde2a4f'

client = OpenAI(
    api_key=os.environ.get(OPENAI_API_KEY),
    base_url="https://api.deepseek.com")

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"},
    ],
    stream=False
)

print(response.choices[0].message.content)