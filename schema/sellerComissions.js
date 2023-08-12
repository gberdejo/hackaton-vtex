const mongoose = require("mongoose");
// mongosh "mongodb://mongo:UpJH4VIrhzMovI2Yadqz@containers-us-west-210.railway.app:7665"
mongoose.connect(
  "mongodb://mongo:UpJH4VIrhzMovI2Yadqz@containers-us-west-210.railway.app:7665",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const sellerComissions = new mongoose.Schema(
  {
    id: String,
    email: String,
    name: String,
    orderId: String,
    skuId: String,
  },
  {
    strict: false, // Habilita el modo no estricto
    collection: "sellerComissions", // Nombre de la colección en la base de datos
  }
);

const sellerComissionsModel = mongoose.model(
  "sellerComissions",
  sellerComissions
);

module.exports = { sellerComissionsModel };
