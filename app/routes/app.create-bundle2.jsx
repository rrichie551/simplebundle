import{ useMemo, useState, useCallback } from "react"; 
import { ChevronLeftIcon, ChevronRightIcon } from "@shopify/polaris-icons";
import {json} from "@remix-run/node";
import {
    Page,
    Card,
    Icon,
    BlockStack,
    InlineStack,
    Text,
    Button
  } from "@shopify/polaris";
  import {
    useSubmit, useNavigation,
  } from "@remix-run/react";
  import { authenticate } from "../shopify.server";
  import { CREATE_PRODUCT_STATUS } from "../api/CREATE_PRODUCT_STATUS";
  import InfiniteStep1 from "../components/InfiniteStep1";
  import InfiniteStep2 from "../components/InfiniteStep2";
  import { useAppBridge } from "@shopify/app-bridge-react";
  import prisma from "../db.server";
  import TwoColumnLayoutTwo from '../components/TwoColumnTwo';
  import {BundleWarningTwo} from "../components/BundleWarningTwo";

  export async function action({request}) {
    const body = await request.formData();
    const bundleData = JSON.parse(body.get('formData'));
    console.log("This is the form data: ",bundleData);
    const bundleStatus = bundleData.status.toUpperCase();
    const { admin, session } = await authenticate.admin(request);
    const response = await admin.graphql(CREATE_PRODUCT_STATUS,{
            variables: {
                "input": {
                    "title": bundleData.bundleName,
                    "status": bundleStatus
                }
            }
        }
      );
      const result = await response.json();
      const data = result.data;
      const offerData = {
        ProductBundleId: data.productCreate.product.id,
        ProductHandle: null,
        bundleName: bundleData.bundleName,
        description: null,
        discountType: null,
        discountValue: null,
        products: bundleData.productOptions,
        bundleType:"infinite",
        userId: session.id,
      };
      await prisma.bundle.create({ data: offerData });
      const operation = Object.keys(data)[0];
      const errors = data[operation].userErrors;

  if (errors && errors.length > 0) {
    throw new Error(`Error creating product bundle: ${JSON.stringify(errors)}`);
  }
  else{
    return json({success: true});
  }
     
    
  }  
export default function CreateComplexBundle() {
    const navigation = useNavigation();
    const app = useAppBridge();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [showBundleWarning, setShowBundleWarning] = useState(true);
    const initialFormData = useMemo(
        () => ({
          bundleName: "",
          status: "draft"
        }),
        [],
      );
      const [formData, setFormData] = useState(initialFormData);  

      const handleChange = useCallback( (field) => (value)=>{
        setFormData((prev) => ({ ...prev, [field]: value }));
      },[]);
      const submit = useSubmit();
      const handlePreviousStep = useCallback(()=>{
        setCurrentStep(1);
      },[])

      const handleFinalSubmit = useCallback((formDataFinal) => {
        const formDataSend = new FormData();
        formDataSend.append("formData", JSON.stringify(formDataFinal));
        submit(formDataSend, {
          method: "post",
          encType: "multipart/form-data",
        });
      },[]);
      const validateStep = useCallback(() => {
        const newErrors = {};
        switch (currentStep) {
          case 1:
            if (!formData.bundleName.trim())
              newErrors.bundleName = "Bundle name is required";
            break;
          case 2:
            if (errors.products || errors.limits) {
              return false;
            }
            break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
        return Object.keys(newErrors).length === 0;
      }, [formData, currentStep,errors.products, errors.limits]);
      const handleSubmit = useCallback( () =>{
        if(validateStep()){
          setCurrentStep(2);
          }
      },[validateStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InfiniteStep1
          formData={formData} 
          handleChange={handleChange} 
          isSubmitting={navigation.state === "submitting"}
          />
        );
      case 2:
        return (
          <InfiniteStep2 app={app} formData={formData} finalSubmit={handleFinalSubmit} isSubmitting={navigation.state === "submitting"} />
        );
      default:
        return null;
    }
  };

  return (
    <Page fullWidth>
       <BlockStack gap="800">
         <BundleWarningTwo
          showBanner={showBundleWarning}
          setShowBanner={setShowBundleWarning}
        />
      <BlockStack gap="800">
       
          <BlockStack gap="500">
            <TwoColumnLayoutTwo step={currentStep}>
              <BlockStack gap="600">
              {renderStep()}
              <Card>
              <InlineStack align="space-between">
              <div>
                      {currentStep > 1 && (
                        <Button onClick={handlePreviousStep}>
                          <InlineStack gap="200">
                            <Icon source={ChevronLeftIcon} />
                            <Text>Previous</Text>
                          </InlineStack>
                        </Button>
                      )}
                    </div>
                    <div>
                      {currentStep < 2 ? (
                        <Button onClick={handleSubmit} primary
                          disabled={currentStep === 2}
                        >
                          <InlineStack gap="200">
                            <Text>Next</Text>
                            <Icon source={ChevronRightIcon} />
                            
                          </InlineStack>
                        </Button>
                      ) : (
                        <InlineStack gap="200">
                          <Button
                            onClick={handleFinalSubmit}
                            variant="primary"
                            loading={navigation.state === "submitting"}
                          >
                            Publish Bundle
                          </Button>
                        </InlineStack>
                      )}
                    </div>
              </InlineStack>
              </Card>
              </BlockStack>
            </TwoColumnLayoutTwo>
          </BlockStack>
       
      </BlockStack>
      </BlockStack>
    </Page>
  )
}
