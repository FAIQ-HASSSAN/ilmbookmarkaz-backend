import type { Schema, Struct } from '@strapi/strapi';

export interface DiscountDiscountCards extends Struct.ComponentSchema {
  collectionName: 'components_discount_discount_cards';
  info: {
    displayName: 'discountCards';
  };
  attributes: {
    itemsNumber: Schema.Attribute.String;
    percentage: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

export interface ProductBulkCardDetails extends Struct.ComponentSchema {
  collectionName: 'components_product_bulk_card_details';
  info: {
    displayName: 'bulkCardDetails';
  };
  attributes: {
    discountPercentage: Schema.Attribute.String;
    quantity: Schema.Attribute.String;
  };
}

export interface ProductBulkCards extends Struct.ComponentSchema {
  collectionName: 'components_product_bulk_cards';
  info: {
    displayName: 'bulkCards';
  };
  attributes: {
    cards: Schema.Attribute.Component<'product.bulk-card-details', true>;
    heading: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'discount.discount-cards': DiscountDiscountCards;
      'product.bulk-card-details': ProductBulkCardDetails;
      'product.bulk-cards': ProductBulkCards;
    }
  }
}
