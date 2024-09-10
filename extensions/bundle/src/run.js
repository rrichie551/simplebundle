// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {

  const itemsWithNoBundle = input.cart.lines.filter((line) => !!line.bundleId?.value === true);
  return{
    operations:[
      ...itemsWithNoBundle.map(item => {
        const bundleItems = item.bundleId?.value;
        console.log(bundleItems);
        const components = JSON.parse(bundleItems);
        const expandOperation = {
          expand:{
            cartLineId: item.id,
            expandedCartItems: components?.map(component => ({
              merchandiseId: `gid://shopify/ProductVariant/${component.id}`,
              quantity: component.quantity
            }))
          }
        }
        return expandOperation;
      })
    ]
  }
};