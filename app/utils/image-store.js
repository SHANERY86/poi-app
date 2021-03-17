const cloudinary = require('cloudinary');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

const ImageStore = {
    configure: function() {
      const credentials = {
        cloud_name: process.env.name,
        api_key: process.env.key,
        api_secret: process.env.secret
      };
      cloudinary.config(credentials);
    },

    uploadImage: async function(imagefile) {
        try{
        await writeFile('app/public/temp.img', imagefile);
        await cloudinary.uploader.upload('app/public/temp.img');
        const response = await cloudinary.v2.api.resources();
        const list = response.resources;
        const url = list[0].url;
        return url;
        }
        catch(err) {
            console.log(err);
        }
      },

      deleteImage: async function(id) {
        await cloudinary.v2.uploader.destroy(id, {});
      }
};

module.exports = ImageStore;