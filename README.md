# jpeg-encoder

Custom JPEG encoder written in Javascript. It implements the JPEG encoding pipeline from color space conversion and block splitting to DCT, quantization, and entropy encoding.

## Features

- Visual preview of the compressed image
- Real-time compression report (original vs compressed size, image dimensions)

## Folder Structure

jpeg-encoder/
├── index.html
├── src/
│ ├── main.js
└── utils/
└── matrix.js

## Installation

- Clone this repo

```bash
git clone https://github.com/your-username/jpeg-compressor.git
cd jpeg-compressor
```

- Install dependencies

```bash
npm install
```

- Run the development server

```bash
npm run dev
```

- Open your browser at http://localhost:5173
