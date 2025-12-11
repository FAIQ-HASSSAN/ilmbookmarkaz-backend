import type { Schema, Struct } from '@strapi/strapi';

export interface CartCartItem extends Struct.ComponentSchema {
  collectionName: 'components_cart_cart_items';
  info: {
    description: 'Item in shopping cart';
    displayName: 'Cart Item';
  };
  attributes: {
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    variant: Schema.Attribute.String;
  };
}

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

export interface OrderOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_order_order_items';
  info: {
    description: 'Individual item in an order';
    displayName: 'Order Item';
  };
  attributes: {
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    productName: Schema.Attribute.String & Schema.Attribute.Required;
    productSku: Schema.Attribute.String;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    total: Schema.Attribute.Decimal & Schema.Attribute.Required;
    variant: Schema.Attribute.String;
  };
}

export interface OrderShippingAddress extends Struct.ComponentSchema {
  collectionName: 'components_order_shipping_addresses';
  info: {
    description: 'Shipping address for an order';
    displayName: 'Shipping Address';
  };
  attributes: {
    address: Schema.Attribute.Text & Schema.Attribute.Required;
    city: Schema.Attribute.String & Schema.Attribute.Required;
    country: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Pakistan'>;
    email: Schema.Attribute.Email;
    firstName: Schema.Attribute.String & Schema.Attribute.Required;
    lastName: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
    postalCode: Schema.Attribute.String;
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

export interface ProductProductVariant extends Struct.ComponentSchema {
  collectionName: 'components_product_product_variants';
  info: {
    description: 'Product variant (size, color, etc.)';
    displayName: 'Product Variant';
  };
  attributes: {
    attributes: Schema.Attribute.JSON;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal;
    sku: Schema.Attribute.String & Schema.Attribute.Unique;
    stock: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'cart.cart-item': CartCartItem;
      'discount.discount-cards': DiscountDiscountCards;
      'order.order-item': OrderOrderItem;
      'order.shipping-address': OrderShippingAddress;
      'product.bulk-card-details': ProductBulkCardDetails;
      'product.bulk-cards': ProductBulkCards;
      'product.product-variant': ProductProductVariant;
    }
  }
}
