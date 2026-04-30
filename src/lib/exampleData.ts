import type { LocalStorageState } from './types';

export const exampleData: LocalStorageState = {
  "foodTypes": [
    {
      "id": "cfd36359-2999-4e90-af2d-c501e5d1e8fb",
      "name": "Rice Bubbles",
      "tags": [
        "Tanya",
        "Breakfast"
      ],
      "weeklyConsumptionRate": 70
    },
    {
      "id": "88692369-d69f-40d5-8b76-d1d7aac43d88",
      "name": "White Rice",
      "tags": [
        "Tanya",
        "Mannan",
        "Staple"
      ],
      "weeklyConsumptionRate": 100
    },
    {
      "id": "86e6292f-494e-4283-b366-32baef577571",
      "name": "Oil",
      "tags": [
        "Tanya",
        "Staple"
      ],
      "weeklyConsumptionRate": 230.13698630136983
    },
    {
      "id": "561e0627-b2b6-4d2d-ae8a-fa90182f820c",
      "name": "Psyllium Husks",
      "tags": [
        "Tanya",
        "Health"
      ],
      "weeklyConsumptionRate": 70
    },
    {
      "id": "418d6719-d653-4e4c-892f-4f3b3622c0e9",
      "name": "Special K",
      "tags": [
        "Tanya",
        "Breakfast"
      ],
      "weeklyConsumptionRate": 330
    },
    {
      "id": "b2577ccb-6087-4c34-9c5c-df90b566312a",
      "name": "Rice Milk",
      "tags": [
        "Tanya",
        "Staple"
      ],
      "weeklyConsumptionRate": 1500
    },
    {
      "id": "2e43c613-772e-4b90-83d0-f29aaa7bbfc4",
      "name": "Oat Milk",
      "tags": [
        "Mannan",
        "Staple"
      ],
      "weeklyConsumptionRate": 1200
    }
  ],
  "items": [
    {
      "id": "dcb8a762-6a9c-4b83-a9d2-a14423436c5d",
      "foodTypeId": "cfd36359-2999-4e90-af2d-c501e5d1e8fb",
      "name": "Kellogg’s Rice Bubbles - Gluten Free",
      "baseAmount": 315,
      "unitType": "g",
      "quantity": 2,
      "purchaseDate": "2026-04-08T00:00:00.000Z",
      "bestBeforeDate": "2027-01-09T00:00:00.000Z",
      "useByDate": null,
      "price": 7,
      "batchNumber": "01:06 6009 KRA2",
      "upc": "8801083421179",
      "imageUrl": "https://images.openfoodfacts.org/images/products/880/108/342/1179/front_en.3.200.jpg"
    },
    {
      "id": "e4242f01-24ca-4ab1-afa5-7f50068ed26a",
      "foodTypeId": "88692369-d69f-40d5-8b76-d1d7aac43d88",
      "name": "Sun Rice Medium grain rice",
      "baseAmount": 5000,
      "unitType": "g",
      "quantity": 2,
      "purchaseDate": "2026-04-23T00:00:00.000Z",
      "bestBeforeDate": "2028-02-16T00:00:00.000Z",
      "useByDate": null,
      "price": 11,
      "batchNumber": "D3 16 FEB 28 22:22",
      "upc": "9310140001050",
      "imageUrl": "https://images.openfoodfacts.org/images/products/931/014/000/1050/front_en.3.200.jpg"
    },
    {
      "id": "986fa185-ba25-46b4-b44a-530e18d3a673",
      "foodTypeId": "88692369-d69f-40d5-8b76-d1d7aac43d88",
      "name": "SunRice Medium Grain White Rice",
      "baseAmount": 1000,
      "unitType": "g",
      "quantity": 1,
      "purchaseDate": "2026-04-30T00:00:00.000Z",
      "bestBeforeDate": "2028-02-12T00:00:00.000Z",
      "useByDate": null,
      "price": null,
      "batchNumber": "L 20 21:23",
      "upc": "9310140283746",
      "imageUrl": "https://images.openfoodfacts.org/images/products/931/014/028/3746/front_en.21.200.jpg"
    },
    {
      "id": "874b4b87-e232-4927-8b27-ab0fbc2040aa",
      "foodTypeId": "86e6292f-494e-4283-b366-32baef577571",
      "name": "Alfa one Rice Bran Oil",
      "baseAmount": 3000,
      "unitType": "ml",
      "quantity": 2,
      "purchaseDate": "2026-04-30T00:00:00.000Z",
      "bestBeforeDate": "2028-01-08T00:00:00.000Z",
      "useByDate": null,
      "price": 14,
      "batchNumber": "S12AFA08B",
      "upc": "9417986937731",
      "imageUrl": "https://images.openfoodfacts.org/images/products/941/798/693/7731/front_en.3.200.jpg"
    },
    {
      "id": "da486e30-6765-45a3-a7f4-c003bac66488",
      "foodTypeId": "561e0627-b2b6-4d2d-ae8a-fa90182f820c",
      "name": "Psyllium Husks",
      "baseAmount": 500,
      "unitType": "g",
      "quantity": 1,
      "purchaseDate": "2026-04-30T00:00:00.000Z",
      "bestBeforeDate": null,
      "useByDate": null,
      "price": null,
      "batchNumber": null,
      "upc": null,
      "imageUrl": null
    },
    {
      "id": "5ad86024-aaf1-4876-b8b4-c72a00e6b5f4",
      "foodTypeId": "418d6719-d653-4e4c-892f-4f3b3622c0e9",
      "name": "Kellogs Kell Special K G / F 330GM imp PROMO",
      "baseAmount": 330,
      "unitType": "g",
      "quantity": 1,
      "purchaseDate": "2026-04-30T00:00:00.000Z",
      "bestBeforeDate": "2026-12-08T00:00:00.000Z",
      "useByDate": null,
      "price": 7.5,
      "batchNumber": null,
      "upc": "8801083673301",
      "imageUrl": "https://images.openfoodfacts.org/images/products/880/108/367/3301/front_en.29.200.jpg"
    },
    {
      "id": "1cc54f82-5bb3-4e6f-8a46-34ebbfb6cdb6",
      "foodTypeId": "b2577ccb-6087-4c34-9c5c-df90b566312a",
      "name": "Vitasoy Rice Milk Unsweetened",
      "baseAmount": 1000,
      "unitType": "ml",
      "quantity": 2,
      "purchaseDate": "2026-04-30T00:00:00.000Z",
      "bestBeforeDate": "2027-03-11T00:00:00.000Z",
      "useByDate": null,
      "price": 2.5,
      "batchNumber": null,
      "upc": "9341650001711",
      "imageUrl": "https://images.openfoodfacts.org/images/products/934/165/000/1711/front_en.18.200.jpg"
    },
    {
      "id": "79812225-67a0-4a6e-819d-7d13e9e9370a",
      "foodTypeId": "2e43c613-772e-4b90-83d0-f29aaa7bbfc4",
      "name": "Oatly Foamable oat milk with added vitamins and calcium",
      "baseAmount": 1000,
      "unitType": "ml",
      "quantity": 5,
      "purchaseDate": "2026-04-30T00:00:00.000Z",
      "bestBeforeDate": "2026-11-07T00:00:00.000Z",
      "useByDate": null,
      "price": 4,
      "batchNumber": null,
      "upc": "7394376617379",
      "imageUrl": "https://images.openfoodfacts.org/images/products/739/437/661/7379/front_en.9.200.jpg"
    }
  ],
  "priceLogs": [
    {
      "id": "cb4767bf-a6d8-4f0b-a1d9-985532459e1a",
      "upc": "7394376617379",
      "price": 5.2,
      "baseAmount": 1000,
      "unitType": "ml",
      "dateLogged": "2026-04-30T07:46:43.082Z"
    },
    {
      "id": "c583c8f5-1c35-4744-a6e5-0706ed730f82",
      "upc": "9310140001050",
      "price": 19,
      "baseAmount": 5000,
      "unitType": "g",
      "dateLogged": "2026-04-30T07:54:38.526Z"
    },
    {
      "id": "53c837cb-27d9-4978-9dc8-23891c1fa2df",
      "upc": "9417986937731",
      "price": 17.65,
      "baseAmount": 3000,
      "unitType": "ml",
      "dateLogged": "2026-04-30T08:08:19.655Z"
    }
  ]
};
