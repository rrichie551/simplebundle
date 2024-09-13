import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  IndexTable,
  Text,
  Thumbnail,
  Badge,
  InlineStack,
  Button,
  ButtonGroup,
  Tooltip,
  IndexFilters,
  useSetIndexFiltersMode,
  RangeSlider,
  ChoiceList,
} from "@shopify/polaris";
import {
  EditIcon,
  ViewIcon,
  DeleteIcon,
  ImageIcon,
} from "@shopify/polaris-icons";
import { useProductFilters } from "../hooks/useProductFilters";
import { useProductSorting } from "../hooks/useProductSorting";

export function ProductTable({ products, onDeleteProduct, fetcher, navigate }) {
  const [selected, setSelected] = useState(0);
  const { mode, setMode } = useSetIndexFiltersMode();

  // const {
  //   priceRange,
  //   bundleType,
  //   queryValue,
  //   handlePriceRangeChange,
  //   handleBundleTypeChange,
  //   handleFiltersQueryChange,
  //   handlePriceRangeRemove,
  //   handleBundleTypeRemove,
  //   handleFiltersClearAll,
  //   filteredProducts,
  // } = useProductFilters(products);

  // const { sortSelected, handleSortChange, sortedProducts } =
  //   useProductSorting(filteredProducts);

  // const tabs = useMemo(
  //   () => [
  //     {
  //       content: "All",
  //       index: 0,
  //       id: "all-products",
  //       count: products.length,
  //     },
  //   ],
  //   [products]
  // );

  // const handleTabChange = useCallback((selectedTabIndex) => {
  //   setSelected(selectedTabIndex);
  // }, []);

  // const filters = [
  //   {
  //     key: "bundleType",
  //     label: "Bundle Type",
  //     filter: (
  //       <ChoiceList
  //         title="Bundle Type"
  //         titleHidden
  //         choices={[
  //           { label: "Fixed", value: "fixed" },
  //           { label: "Variable", value: "variable" },
  //         ]}
  //         selected={bundleType || []}
  //         onChange={handleBundleTypeChange}
  //         allowMultiple
  //       />
  //     ),
  //     shortcut: true,
  //   },
  //   {
  //     key: "priceRange",
  //     label: "Price range",
  //     filter: (
  //       <RangeSlider
  //         label="Price range"
  //         labelHidden
  //         value={priceRange || [0, 2000]}
  //         prefix="$"
  //         output
  //         min={0}
  //         max={2000}
  //         step={1}
  //         onChange={handlePriceRangeChange}
  //       />
  //     ),
  //   },
  // ];

  // const appliedFilters = [
  //   ...(bundleType?.length > 0
  //     ? [
  //         {
  //           key: "bundleType",
  //           label: `Bundle Type: ${bundleType.join(", ")}`,
  //           onRemove: handleBundleTypeRemove,
  //         },
  //       ]
  //     : []),
  //   ...(priceRange
  //     ? [
  //         {
  //           key: "priceRange",
  //           label: `Price: $${priceRange[0]} - $${priceRange[1]}`,
  //           onRemove: handlePriceRangeRemove,
  //         },
  //       ]
  //     : []),
  // ];

  const resourceName = {
    singular: "bundle",
    plural: "bundles",
  };

  const rowMarkup = products.map((product, index) => {
    const firstProduct = product.products?.[0] || {};
    const firstVariant = firstProduct.variants?.[0] || {};
    const firstImage = firstProduct.images?.[0];

    return (
      <IndexTable.Row
        id={product.id.toString()}
        key={product.id}
        position={index}
      >
        <IndexTable.Cell>
          <InlineStack blockAlign="center" align="start" gap="400">
            <Thumbnail
              source={firstImage?.originalSrc || ImageIcon}
              alt={firstProduct?.title || "Product image"}
              size="small"
            />
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {product?.bundleName || "Untitled Bundle"}
            </Text>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            ${parseFloat(product.variants?.[0]?.price || 0).toFixed(2)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {firstVariant.inventoryQuantity || 0}
          </Text>
        </IndexTable.Cell>
        {/* <IndexTable.Cell>
          <Badge tone={firstVariant.availableForSale ? "success" : "critical"}>
            {firstVariant.availableForSale ? "Active" : "Inactive"}
          </Badge>
        </IndexTable.Cell> */}
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {firstProduct.vendor || "Unknown Vendor"}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span" textTransform="capitalize">
            {product.bundleType || "Unknown"}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <ButtonGroup segmented>
            <Tooltip content="Edit bundle" dismissOnMouseOut>
              <Button
                size="slim"
                icon={EditIcon}
                onClick={() => {
                  if (product.bundleType === 'infinite') {
                    // For infinite bundles, use product.id
                    navigate(`/app/infinite/${product.id}`, "_self");
                  } else {
                    // For fixed bundles, use ProductBundleId
                    const bundleId = product.ProductBundleId?.split("/").pop();
                    if (bundleId) {
                      navigate(`/app/bundles/${bundleId}`, "_self");
                    }
                  }
                }}
              />
            </Tooltip>
            {/* <Tooltip content="Preview bundle" dismissOnMouseOut>
              <Button
                size="slim"
                icon={ViewIcon}
                onClick={() =>
                  window.open(product.onlineStorePreviewUrl, "_blank")
                }
                loading={fetcher.state === "submitting"}
              />
            </Tooltip> */}
            <Tooltip content="Delete bundle" dismissOnMouseOut>
              <Button
                size="slim"
                icon={DeleteIcon}
                onClick={() => onDeleteProduct(product.ProductBundleId, product.id)}
                loading={fetcher.state === "submitting"}
              />
            </Tooltip>
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Card>
      {/* <IndexFilters
        sortOptions={[
          { label: "Bundle", value: "bundleName asc", directionLabel: "A-Z" },
          { label: "Bundle", value: "bundleName desc", directionLabel: "Z-A" },
          {
            label: "Price",
            value: "price asc",
            directionLabel: "Lowest to highest",
          },
          {
            label: "Price",
            value: "price desc",
            directionLabel: "Highest to lowest",
          },
          {
            label: "Bundle Type",
            value: "bundleType asc",
            directionLabel: "A-Z",
          },
          {
            label: "Bundle Type",
            value: "bundleType desc",
            directionLabel: "Z-A",
          },
        ]}
        sortSelected={sortSelected}
        queryValue={queryValue}
        queryPlaceholder="Search bundles"
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={() => handleFiltersQueryChange("")}
        onSort={handleSortChange}
        cancelAction={{
          onAction: handleFiltersClearAll,
          disabled: false,
          loading: false,
        }}
        tabs={tabs}
        selected={selected}
        onSelect={handleTabChange}
        filters={filters}
        appliedFilters={appliedFilters}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
      /> */}
      <IndexTable
        resourceName={resourceName}
        itemCount={products.length}
        headings={[
          { title: "Bundle" },
          { title: "Price" },
          { title: "Inventory" },
          // { title: "Status" },
          { title: "Vendor" },
          { title: "Bundle Type" },
          { title: "Actions" },
        ]}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}