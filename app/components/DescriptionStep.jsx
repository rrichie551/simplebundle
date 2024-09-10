import React, { useCallback, useState, useEffect } from "react";
import { 
  Card, 
  BlockStack, 
  Text, 
  TextField, 
  Button, 
  InlineStack, 
  Tag,
  Select,
  Autocomplete,
  Thumbnail,
  ResourceList,
  ResourceItem,
  Icon
} from "@shopify/polaris";
import { SearchIcon, PlusCircleIcon, CollectionIcon } from '@shopify/polaris-icons';

export default function DescriptionStep({ formData, setFormData, errors, setErrors, app, productTags, productTypes }) {
  const [selectedTags, setSelectedTags] = useState(formData.productTags || []);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allTags, setAllTags] = useState(productTags);

  useEffect(() => {
    setOptions(allTags.map(tag => ({ value: tag, label: tag })));
  }, [allTags]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, productTags: selectedTags }));
  }, [selectedTags, setFormData]);

  const handleCollectionSelection = useCallback(async () => {
    try {
      const selection = await app.resourcePicker({
        type: "collection",
        action: "select",
        multiple: true,
        selectionIds: formData.collectionsToJoin.map(collection => ({ id: collection.id }))
      });

      if (selection && selection.length > 0) {
        const newCollections = selection.map(collection => ({
          id: collection.id,
          title: collection.title,
          image: collection.image?.originalSrc || null
        }));

        setFormData(prev => ({
          ...prev,
          collectionsToJoin: newCollections
        }));

        setErrors(prev => ({
          ...prev,
          collectionsToJoin: null
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        collectionsToJoin: "Error selecting collections. Please try again."
      }));
    }
  }, [app, formData.collectionsToJoin, setFormData, setErrors]);

  const handleChange = useCallback((field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [setFormData, errors, setErrors]);

  const removeCollection = useCallback((collectionId) => {
    setFormData(prev => ({
      ...prev,
      collectionsToJoin: prev.collectionsToJoin.filter(c => c.id !== collectionId)
    }));
  }, [setFormData]);

  const updateText = useCallback(
    (value) => {
      setInputValue(value);
      setLoading(true);

      setTimeout(() => {
        if (value === '') {
          setOptions(allTags.map(tag => ({ value: tag, label: tag })));
          setLoading(false);
          return;
        }

        const filterRegex = new RegExp(value, 'i');
        const resultOptions = allTags
          .filter((tag) => tag.match(filterRegex))
          .map(tag => ({ value: tag, label: tag }));
        setOptions(resultOptions);
        setLoading(false);
      }, 300);
    },
    [allTags]
  );

  const handleTagSelection = useCallback(
    (selected) => {
      setSelectedTags(selected);
      setInputValue('');
    },
    []
  );

  const removeTag = useCallback(
    (tag) => {
      const newSelectedTags = selectedTags.filter((selectedTag) => selectedTag !== tag);
      setSelectedTags(newSelectedTags);
    },
    [selectedTags]
  );

  const handleAddNewTag = useCallback(() => {
    if (inputValue && !allTags.includes(inputValue)) {
      const newTag = inputValue.trim();
      setSelectedTags(prev => [...prev, newTag]);
      setAllTags(prev => [...prev, newTag]);
      setInputValue('');
    }
  }, [inputValue, allTags]);

  const tagsMarkup = selectedTags.length > 0 ? (
    <InlineStack gap="200">
      {selectedTags.map((tag) => (
        <Tag key={`tag-${tag}`} onRemove={() => removeTag(tag)}>
          {tag}
        </Tag>
      ))}
    </InlineStack>
  ) : null;

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Product Tags"
      value={inputValue}
      placeholder="Search tags or enter a new one"
      verticalContent={tagsMarkup}
      prefix={<Icon source={SearchIcon} />}
      autoComplete="off"
    />
  );

  return (
    <Card>
      <BlockStack gap="500">
        <Text variant="headingLg" as="h2">
          Describe your Bundle
        </Text>
        <Select
          label="Product Type"
          options={[
            { label: 'Select a product type', value: '' },
            ...productTypes.map(type => ({ label: type, value: type }))
          ]}
          onChange={handleChange("productType")}
          value={formData.productType || ''}
          error={errors.productType}
        />
        
        <Autocomplete
          allowMultiple
          options={options}
          selected={selectedTags}
          onSelect={handleTagSelection}
          textField={textField}
          loading={loading}
          listTitle="Suggested Tags"
          actionBefore={{
            accessibilityLabel: 'Add new tag',
            content: 'Add new tag',
            icon: PlusCircleIcon,
            onAction: handleAddNewTag,
          }}
        />
        
        <Button onClick={handleCollectionSelection}>Select Collections</Button>
        {errors.collectionsToJoin && <Text tone="critical">{errors.collectionsToJoin}</Text>}
        
        {formData.collectionsToJoin.length > 0 && (
          <ResourceList
            resourceName={{ singular: 'collection', plural: 'collections' }}
            items={formData.collectionsToJoin}
            renderItem={(item) => {
              const { id, title, image } = item;
              const media = image ? (
                <Thumbnail source={image} alt={title} size="small" />
              ) : (
                <Thumbnail
                  source={CollectionIcon}
                  alt={title}
                  size="small"
                  color="base"
                />
              );

              return (
                <ResourceItem
                  id={id}
                  media={media}
                  accessibilityLabel={`View details for ${title}`}
                  name={title}
                >
                  <h3>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                      {title}
                    </Text>
                  </h3>
                  <Button plain onClick={() => removeCollection(id)}>Remove</Button>
                </ResourceItem>
              );
            }}
          />
        )}
        <TextField
          label="Description"
          value={formData.description}
          onChange={handleChange("description")}
          error={errors.description}
          multiline={4}
          autoComplete="off"
        />
      </BlockStack>
    </Card>
  );
}