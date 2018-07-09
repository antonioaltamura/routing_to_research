# Routing to Research


## Installation
- Install Node.js https://nodejs.org/en/
- Install Neo4j for your platform https://neo4j.com
- Install `yarn` module `npm install -g yarn`
- Add your local credentials in `config.js`
- run `yarn install`
- run `cd public && yarn install`

## DB initialization
- Copy the files in CSV folder in the Neo4j **import** folder
- from the project root run `yarn init` 

## Run
Just launch
`yarn start` and open `http://localhost:3000`
<img src="public/img/screenshot/1.png" alt="Front page"/>

<img style="width:50%" src="public/img/screenshot/2.png" alt="Screen2"/>
<img style="width:50%" src="public/img/screenshot/3.png" alt="Screen3"/>
<img style="width:50%" src="public/img/screenshot/4.png" alt="Screen4"/>
<img style="width:50%" src="public/img/screenshot/5.png" alt="Screen5"/>



**NOTE:** `pdf-image` module has been fixed to works with the currrent release of ImageMagick for Windows (7.0.8-6).
In order to work with Linux env you need to edit the Imagemagick command on `utils/pdf-image/index.js` on `#96` and `#104`.