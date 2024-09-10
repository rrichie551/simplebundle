import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Card,
  DropZone,
  BlockStack,
  InlineStack,
  Text,
  Icon,
  Banner,
  Button,
  Thumbnail,
  Modal,
  Tooltip
} from '@shopify/polaris';
import { PlusCircleIcon, XIcon, ImageIcon } from '@shopify/polaris-icons';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_IMAGE_DIMENSIONS = 5000; // 5000 x 5000 px
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const MAX_VIDEO_LENGTH = 10 * 60; // 10 minutes in seconds
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1 GB

export default function MediaSelection({ onChange, initialFiles = [], productImages }) {
  const [files, setFiles] = useState(initialFiles);
  const [thumbnails, setThumbnails] = useState({});
  const [error, setError] = useState('');
  const [showProductImages, setShowProductImages] = useState(false);

  const validateFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        if (file.size > MAX_FILE_SIZE) {
          reject("Image file size must be smaller than 20 MB.");
        }
        const img = new Image();
        img.onload = () => {
          if (img.width > MAX_IMAGE_DIMENSIONS || img.height > MAX_IMAGE_DIMENSIONS) {
            reject("Image dimensions must be 5000x5000 px or smaller.");
          } else {
            resolve();
          }
        };
        img.onerror = () => reject("Failed to load image.");
        img.src = URL.createObjectURL(file);
      } else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
        if (file.size > MAX_VIDEO_SIZE) {
          reject("Video file size must be smaller than 1 GB.");
        }
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_LENGTH) {
            reject("Video length must be 10 minutes or less.");
          } else {
            resolve();
          }
        };
        video.onerror = () => reject("Failed to load video.");
        video.src = URL.createObjectURL(file);
      } else {
        reject("File type not supported. Please upload PNG, JPEG, GIF, BMP, WebP images or MP4, MOV videos.");
      }
    });
  }, []);

  const handleDropZoneDrop = useCallback(
    async (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setError('');
      const validFiles = [];
      for (const file of acceptedFiles) {
        try {
          await validateFile(file);
          validFiles.push(file);
        } catch (err) {
          setError(err);
          return;
        }
      }

      const newFiles = validFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        src: URL.createObjectURL(file),
        file: file
      }));

      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles, ...newFiles];
        onChange(updatedFiles);
        return updatedFiles;
      });
    },
    [onChange, validateFile]
  );

  const handleRemoveFile = useCallback(
    (index, event) => {
      event.stopPropagation();
      const newFiles = [...files];
      if (!newFiles[index].isProductImage) {
        URL.revokeObjectURL(newFiles[index].src);
      }
      newFiles.splice(index, 1);
      setFiles(newFiles);
      onChange(newFiles);
    },
    [files, onChange]
  );

  const handleAddProductImage = useCallback((image) => {
    if (files.some(file => file.src === image.originalSrc)) {
      // Image already exists, don't add it again
      return;
    }

    const newFile = {
      name: image.id,
      type: image.type || 'image/jpeg',
      size: image.size || 0,
      src: image.originalSrc,
      isProductImage: true,
      altText: image.altText
    };

    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, newFile];
      onChange(updatedFiles);
      return updatedFiles;
    });
  }, [files, onChange]);

  const generateVideoThumbnail = useCallback((file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadeddata = () => {
        video.currentTime = 1; // Set to 1 second to avoid black frames
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL();
        resolve(thumbnailUrl);
      };
      video.src = URL.createObjectURL(file.file);
    });
  }, []);

  const filesToProcess = useMemo(() => {
    return files.filter(file => 
      ACCEPTED_VIDEO_TYPES.includes(file.type) && !thumbnails[file.name]
    );
  }, [files, thumbnails]);

  useEffect(() => {
    const generateThumbnails = async () => {
      const newThumbnails = { ...thumbnails };
      for (const file of filesToProcess) {
        const thumbnail = await generateVideoThumbnail(file);
        newThumbnails[file.name] = thumbnail;
      }
      setThumbnails(newThumbnails);
    };

    if (filesToProcess.length > 0) {
      generateThumbnails();
    }
  }, [filesToProcess, generateVideoThumbnail, thumbnails]);

  const renderThumbnail = useCallback((file) => {
    if (file.isProductImage) {
      return file.src;
    } else if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return file.src;
    } else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return thumbnails[file.name] || file.src;
    }
  }, [thumbnails]);

  const mediaCards = (
    <InlineStack gap="400" wrap={true}>
      {files.map((file, index) => (
        <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
          <Card padding="0">
            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <Thumbnail
                source={renderThumbnail(file)}
                alt={file.altText || "Media thumbnail"}
                size="large"
              />
            </div>
          </Card>
          <div
            onClick={(event) => handleRemoveFile(index, event)}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              cursor: 'pointer',
              background: 'white',
              borderRadius: '50%',
              padding: '2px'
            }}
          >
            <Icon source={XIcon} color="base" />
          </div>
        </div>
      ))}
      {files.length > 0 && (
        <div style={{ width: '100px', height: "100px" }}>
          <Card padding="0">
            <div style={{ width: '100%', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Icon source={PlusCircleIcon} color="base" />
            </div>
          </Card>
        </div>
      )}
    </InlineStack>
  );

  const productImageCards = (
    <Modal
      open={showProductImages}
      onClose={() => setShowProductImages(false)}
      title="Select from Product Images"
    >
      <Modal.Section>
        <InlineStack gap="400" wrap={true}>
          {productImages.flatMap((product, productIndex) => 
            product.map((image, imageIndex) => {
              const isAdded = files.some(file => file.src === image.originalSrc);
              return (
                <div 
                  key={`${productIndex}-${imageIndex}`} 
                  style={{ 
                    position: 'relative', 
                    width: '100px', 
                    height: '100px',
                    opacity: isAdded ? 0.5 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Card padding="0">
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => !isAdded && handleAddProductImage(image)}
                    >
                      <Thumbnail
                        source={image.originalSrc}
                        alt={image.altText}
                        size="large"
                      />
                      {isAdded && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.5)'
                        }}>
                          <Text variant="bodySm">Added</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                  {!isAdded && (
                    <Tooltip content="Add image">
                      <div
                        onClick={() => handleAddProductImage(image)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          cursor: 'pointer',
                          background: 'white',
                          borderRadius: '50%',
                          padding: '2px'
                        }}
                      >
                        <Icon source={PlusCircleIcon} color="base" />
                      </div>
                    </Tooltip>
                  )}
                </div>
              );
            })
          )}
        </InlineStack>
      </Modal.Section>
    </Modal>
  );

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingLg" as="h2">
          Media Selection
        </Text>
        {error && (
          <Banner status="critical">
            <p>{error}</p>
          </Banner>
        )}
        {productImageCards}
        <DropZone 
          onDrop={handleDropZoneDrop}
          allowMultiple={true}
          accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
          fullWidth
        >
          {files.length === 0 ? (
            <BlockStack gap="400" alignment="center">
              <Icon source={ImageIcon} color="base" />
              <Text variant="bodySm" color="subdued" alignment='center'>
                Drop files to upload or click to browse
              </Text>
            </BlockStack>
          ) : (
            mediaCards
          )}
        </DropZone> 
        <Button onClick={() => setShowProductImages(true)}>
                Select Images from Products
              </Button>
      </BlockStack>
    </Card>
  );
}