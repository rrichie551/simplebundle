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
  TextField,
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
import { StatusChangeButton } from "./StateChangeButton";

export function ProductTable({ products, onStatusChange, onDeleteProduct, fetcher }) {
  const [itemStrings, setItemStrings] = useState([
    "All",
    "Active",
    "Draft",
    "Archived",
  ]);
  const [selected, setSelected] = useState(0);
  const [customViews, setCustomViews] = useState([]);
  const { mode, setMode } = useSetIndexFiltersMode();

  const {
    status,
    priceRange,
    inventoryRange,
    vendor,
    queryValue,
    handleStatusChange,
    handlePriceRangeChange,
    handleInventoryRangeChange,
    handleVendorChange,
    handleFiltersQueryChange,
    handleStatusRemove,
    handlePriceRangeRemove,
    handleInventoryRangeRemove,
    handleVendorRemove,
    handleFiltersClearAll,
    filteredProducts,
  } = useProductFilters(products);

  const { sortSelected, handleSortChange, sortedProducts } =
    useProductSorting(filteredProducts);

  const tabs = useMemo(() => [
    ...itemStrings.map((item, index) => ({
      content: item,
      index,
      id: `default-${index}`,
      count: item === "All" ? products.length : products.filter(p => p.node.status === item.toUpperCase()).length,
    })),
    ...customViews.map((view, index) => ({
      content: view.name,
      index: itemStrings.length + index,
      id: `custom-${view.name}`,
    })),
  ], [itemStrings, customViews, products]);

  const handleSelectCustomView = useCallback(
    (index) => {
      const view = customViews[index];
      handleStatusChange(view.filters.status);
      handlePriceRangeChange(view.filters.priceRange);
      handleInventoryRangeChange(view.filters.inventoryRange);
      handleVendorChange(view.filters.vendor);
      handleFiltersQueryChange(view.filters.queryValue);
    },
    [
      customViews,
      handleStatusChange,
      handlePriceRangeChange,
      handleInventoryRangeChange,
      handleVendorChange,
      handleFiltersQueryChange,
    ]
  );

  const handleTabChange = useCallback(
    (selectedTabIndex) => {
      setSelected(selectedTabIndex);
      if (selectedTabIndex === 0) {
        handleStatusRemove();
      } else if (selectedTabIndex < itemStrings.length) {
        handleStatusChange([itemStrings[selectedTabIndex].toUpperCase()]);
      } else {
        const customViewIndex = selectedTabIndex - itemStrings.length;
        handleSelectCustomView(customViewIndex);
      }
    },
    [itemStrings, handleStatusRemove, handleStatusChange, handleSelectCustomView]
  );

  const handleCreateNewView = useCallback(
    (value) => {
      const newView = {
        name: value,
        filters: { status, priceRange, inventoryRange, vendor, queryValue },
      };
      setCustomViews((prev) => [...prev, newView]);
      setItemStrings((prev) => [...prev, value]);
      setSelected(itemStrings.length + customViews.length);
    },
    [status, priceRange, inventoryRange, vendor, queryValue, itemStrings.length, customViews.length]
  );

  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: "Active", value: "ACTIVE" },
            { label: "Draft", value: "DRAFT" },
            { label: "Archived", value: "ARCHIVED" },
          ]}
          selected={status || []}
          onChange={handleStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "priceRange",
      label: "Price range",
      filter: (
        <RangeSlider
          label="Price range"
          labelHidden
          value={priceRange || [0, 1000]}
          prefix="$"
          output
          min={0}
          max={1000}
          step={1}
          onChange={handlePriceRangeChange}
        />
      ),
    },
    {
      key: "inventoryRange",
      label: "Inventory range",
      filter: (
        <RangeSlider
          label="Inventory range"
          labelHidden
          value={inventoryRange || [0, 100]}
          output
          min={0}
          max={100}
          step={1}
          onChange={handleInventoryRangeChange}
        />
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      filter: (
        <TextField
          label="Vendor"
          value={vendor}
          onChange={handleVendorChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [
    ...(status?.length > 0
      ? [
          {
            key: "status",
            label: `Status: ${status.join(", ")}`,
            onRemove: handleStatusRemove,
          },
        ]
      : []),
    ...(priceRange
      ? [
          {
            key: "priceRange",
            label: `Price: $${priceRange[0]} - $${priceRange[1]}`,
            onRemove: handlePriceRangeRemove,
          },
        ]
      : []),
    ...(inventoryRange
      ? [
          {
            key: "inventoryRange",
            label: `Inventory: ${inventoryRange[0]} - ${inventoryRange[1]}`,
            onRemove: handleInventoryRangeRemove,
          },
        ]
      : []),
    ...(vendor
      ? [
          {
            key: "vendor",
            label: `Vendor: ${vendor}`,
            onRemove: handleVendorRemove,
          },
        ]
      : []),
  ];

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const rowMarkup = sortedProducts.map(({ node: product }, index) => (
    <IndexTable.Row
      id={product.id}
      key={product.id}
      position={index}
    >
      <IndexTable.Cell>
        <InlineStack blockAlign="center" align="start" gap="400">
          <Thumbnail
            source={product.featuredImage?.url || ImageIcon}
            alt={product.title}
            size="small"
          />
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {product.title}
          </Text>
        </InlineStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {product.priceRangeV2.minVariantPrice.currencyCode}{" "}
          {parseFloat(product.priceRangeV2.minVariantPrice.amount).toFixed(2)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {product.totalInventory}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={product.status === "ACTIVE" ? "success" : "info"}>
          {product.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {product.vendor}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <ButtonGroup segmented>
          <Tooltip content="Edit product" dismissOnMouseOut>
            <Button
              size="slim"
              icon={EditIcon}
              onClick={() =>
                window.open(
                  `shopify://admin/products/${product.id.split("/").pop()}`,
                  "_self",
                )
              }
               loading={fetcher.state === "submitting"}
            />
          </Tooltip>
          <Tooltip content="Preview product" dismissOnMouseOut>
            <Button
              size="slim"
              icon={ViewIcon}
              onClick={() =>
                window.open(
                  product.onlineStorePreviewUrl,
                  "_blank",
                )
              }
               loading={fetcher.state === "submitting"}
            />
          </Tooltip>
          <StatusChangeButton
            status={product.status}
            onStatusChange={(newStatus) => onStatusChange(product.id, newStatus)}
              loading={fetcher.state === "submitting"}
          />
          <Tooltip content="Delete product" dismissOnMouseOut>
            <Button
              size="slim"
              icon={DeleteIcon}
              onClick={() => onDeleteProduct(product.id)}
               loading={fetcher.state === "submitting"}
            />
          </Tooltip>
        </ButtonGroup>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Card>
      <IndexFilters
        sortOptions={[
          { label: "Product", value: "product asc", directionLabel: "A-Z" },
          { label: "Product", value: "product desc", directionLabel: "Z-A" },
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
            label: "Inventory",
            value: "inventory asc",
            directionLabel: "Lowest to highest",
          },
          {
            label: "Inventory",
            value: "inventory desc",
            directionLabel: "Highest to lowest",
          },
        ]}
        sortSelected={sortSelected}
        queryValue={queryValue}
        queryPlaceholder="Search products"
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={() => handleFiltersQueryChange("")}
        onSort={handleSortChange}
        primaryAction={{ content: "Add product", onAction: () => {} }}
        cancelAction={{
          onAction: handleFiltersClearAll,
          disabled: false,
          loading: false,
        }}
        tabs={tabs.map(tab => ({
          ...tab,
          key: tab.id,
        }))}
        selected={selected}
        onSelect={handleTabChange}
        filters={filters}
        appliedFilters={appliedFilters}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
        canCreateNewView
        onCreateNewView={handleCreateNewView}
      />
      <IndexTable
        resourceName={resourceName}
        itemCount={sortedProducts.length}
        headings={[
          { title: "Product" },
          { title: "Price" },
          { title: "Inventory" },
          { title: "Status" },
          { title: "Vendor" },
          { title: "Actions" },
        ]}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}