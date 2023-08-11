const axios = require("axios");
const { sellerComissionsModel } = require("./schema/sellerComissions");

const worker = async () => {
  try {
    const headers = {
      "X-VTEX-API-AppKey": "vtexappkey-cxperu07-WVXDEB",
      "X-VTEX-API-AppToken":
        "UJLQJMKBWSBGBLBPCOSLFGUKVBUKISGLYGTDOPODAQXJJICSKZQAHJEGGFFYPHWZMRLUJSWUZRDTPBQMWTABNGVXEXPCQBTVSVZSXLQDLCDKOQNKAEJSYXMYFKMWHPFA",
    };

    const urlSellers =
      "https://cxperu07.vtexcommercestable.com.br/api/seller-register/pvt/sellers";

    const urlSellersComissions =
      "https://cxperu07.vtexcommercestable.com.br/api/seller-register/pvt/sellers/{sellerId}/commissions";

    const urlOrders =
      "https://cxperu07.vtexcommercestable.com.br/api/oms/pvt/orders";

    const urlOrder =
      "https://cxperu07.vtexcommercestable.com.br/api/oms/pvt/orders/orderId";

    const [sellers, orders] = await Promise.all([
      axios.get(urlSellers, {
        headers,
      }),
      axios.get(
        urlOrders +
          `?f_creationDate=creationDate%3A%5B2023-08-01T02%3A00%3A00.000Z%20TO%202023-08-31T01%3A59%3A59.999Z%5D`,
        {
          headers,
        }
      ),
    ]);

    if (sellers.status !== 200 || !sellers.data || !sellers.data.items) return;
    if (orders.status !== 200 || !orders.data || !orders.data.list) return;

    console.log(`sellers: `, sellers.data);
    console.log("orders: ", orders.data);

    const { items } = sellers.data;
    const { list } = orders.data;

    if (!Array.isArray(items) || items.length === 0) return;
    if (!Array.isArray(list) || list.length === 0) return;

    const sellersDetails = await Promise.all(
      items.map(async (item) => {
        const sellerDetail = await axios.get(
          urlSellersComissions.replaceAll("{sellerId}", item.id),
          {
            headers: {
              "X-VTEX-API-AppKey": "vtexappkey-cxperu07-WVXDEB",
              "X-VTEX-API-AppToken":
                "UJLQJMKBWSBGBLBPCOSLFGUKVBUKISGLYGTDOPODAQXJJICSKZQAHJEGGFFYPHWZMRLUJSWUZRDTPBQMWTABNGVXEXPCQBTVSVZSXLQDLCDKOQNKAEJSYXMYFKMWHPFA",
            },
          }
        );

        return { ...item, ...sellerDetail.data[0] };
      })
    );

    const ordersDetails = await Promise.all(
      list.map(async (order) => {
        const orderDetail = await axios.get(
          urlOrder.replaceAll("orderId", order.orderId),
          {
            headers: {
              "X-VTEX-API-AppKey": "vtexappkey-cxperu07-WVXDEB",
              "X-VTEX-API-AppToken":
                "UJLQJMKBWSBGBLBPCOSLFGUKVBUKISGLYGTDOPODAQXJJICSKZQAHJEGGFFYPHWZMRLUJSWUZRDTPBQMWTABNGVXEXPCQBTVSVZSXLQDLCDKOQNKAEJSYXMYFKMWHPFA",
            },
          }
        );
        console.log(orderDetail.data.sellers);
        return orderDetail.data;
      })
    );

    console.log(`sellersDetails: `, sellersDetails);
    console.log(`ordersDetails: `, ordersDetails);

    const orderWithSeller = ordersDetails
      .map((order) => {
        const seller = sellersDetails.find(
          (seller) =>
            order.sellers &&
            Array.isArray(order.sellers) &&
            order.sellers.length > 0 &&
            order.sellers[0].id === seller.id
        );

        if (seller) return { seller, order };

        return null;
      })
      .filter((item) => item);

    console.log(`orderWithSeller: `, orderWithSeller);

    const sellerComissions = orderWithSeller.map(({ seller, order }) => {
      const value = order.value / 100;
      const comission = value * (seller.productCommissionPercentage / 100);
      return {
        orderId: order.orderId,
        sellerId: seller.id,
        comission,
        orderValue: value,
        sellerEmail: seller.email,
        sellerName: seller.name,
        sellerProductCommissionPercentage: seller.productCommissionPercentage,
      };
    });
    console.log("sellerComissions: ", sellerComissions);

    const saveOrUpdate = await Promise.all(
      sellerComissions.map(async (item) => {
        const order = await sellerComissionsModel.findOne({
          orderId: item.orderId,
        });

        if (order) {
          await sellerComissionsModel.updateOne(
            { orderId: item.orderId },
            item
          );
          return `${item.orderId}: updated`;
        } else {
          await sellerComissionsModel.create(item);
          return `${item.orderId}: created`;
        }
      })
    );

    console.log("saveOrUpdate: ", saveOrUpdate);
    return;
  } catch (error) {
    console.log(error);
  }
};

worker();
