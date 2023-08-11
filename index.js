// server.js
const express = require("express");
const { sellerComissionsModel } = require("./schema/sellerComissions");
const { createObjectCsvStringifier } = require("csv-writer");

const app = express();
const PORT = process.env.PORT || 3000;

// Define a route to fetch product data from VTEX store
app.get("/sellers/comissions", async (req, res) => {
  try {
    const list = await sellerComissionsModel.find();
    res.status(200).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product data" });
  }
});

app.get("/sellers/generate-csv", async (req, res) => {
  const data = await sellerComissionsModel.find();
  console.log(data);

  const sellers = data.map(
    ({
      orderId,
      sellerId,
      comission,
      orderValue,
      sellerEmail,
      sellerName,
      sellerProductCommissionPercentage,
    }) => {
      return {
        orderId,
        sellerId,
        comission,
        orderValue,
        sellerEmail: sellerEmail || "",
        sellerName,
        sellerProductCommissionPercentage,
      };
    }
  );

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: "orderId", title: "orderId" },
      { id: "orderValue", title: "orderValue" },
      { id: "sellerId", title: "sellerId" },
      { id: "sellerEmail", title: "sellerEmail" },
      {
        id: "sellerProductCommissionPercentage",
        title: "sellerProductCommissionPercentage",
      },
      { id: "comission", title: "comission" },
    ],
  });

  const csvData =
    csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(sellers);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=data.csv");
  res.attachment("data.csv");
  res.send(csvData);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
