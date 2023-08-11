const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
