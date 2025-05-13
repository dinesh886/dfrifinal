"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormLayout from "../../../layouts/FormLayout";
import "./StepForm.css";
import StepForm1 from "./StepForm1";
import StepForm2 from "./StepForm2";
import StepForm3 from "./StepForm3";
import { ArrowLeftToLine, Send, Save } from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";
import UploadPopup from "../../../components/UploadPopup";
import SuccessPopup from "../../../components/SuccessPopup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiGet } from "../../../services/api-helper";

const StepForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [step, setStep] = useState(1);
  const initialFormState = {
    section1: {
      patient_name: "",
      consentForm: null,
      consentFormPreview: null,
      consentDownloaded: false,
      consentUploaded: false,
      consentVerified: false,
      address: "",
      locality: "",
      age: "",
      gender: "",
      facilityName: "",
      facilityLocation: "",
      facilityType: "",
      education: "",
      occupation: "",
      maritalStatus: "",
      monthlyIncome: "",
      familyMembers: "",
      dependents: "",
      diabetesType: "",
      diabetesDuration: "",
      hasUlcer: false,
      ulcerDuration: "",
      hasAmputation: false,
      amputationDuration: "",
      hasAngioplasty: false,
      angioplastyDuration: "",
      smoking: "",
      alcohol: "",
      tobacco: "",
      Renal: "",
      retinal: "",
      cardiovascular: "",
      cerebrovascular: "",
      imbIschemia: "",
      hypertension: "",
    },
    section2: {
      firstAssessment: "",
      attendedBefore: "",
      facilityVisited: "",
      intervalToAssessment: "",
      referredBy: "",
      treatedDays: "",
      referredInDays: "",
      visitedInDays: "",
      necrosis: "",
      necrosisPhoto: null,
      necrosisPhotoPreview: "",
      gangrene: "",
      gangreneType: "",
      boneExposure: "",
      osteomyelitis: "",
      sepsis: "",
      arterialIssues: "",
      infection: "",
      swelling: "",
      erythema: "",
      tenderness: "",
      warmth: "",
      discharge: "",
      cultureReport: "",
      woundSize: "",
      woundLocation: "",
      woundDuration: "",
      woundClassification: "",
      socGiven: "",
      socDetails: "",
      dressingMaterial: "",
      offloadingDevice: "",
      hospitalization: "",
      amputation: "",
      amputationType: "",
      amputationLevel: "",
      debridementWithAmputation: "",
      deathDate: "",
      deathReason: "",
      woundReferenceFile: null,
      woundReferenceFilePreview: null,
    },
    section3: {
      burningSensation: "",
      painWhileWalking: "",
      skinChanges: "",
      sensationLoss: "",
      nailProblems: "",
      fungalInfection: "",
      skinLesions: "",
      openWound: "",
      cellulitis: "",
      monofilamentLeftA: "",
      monofilamentLeftB: "",
      monofilamentLeftC: "",
      monofilamentRightA: "",
      monofilamentRightB: "",
      monofilamentRightC: "",
      footDeformities: "",
      deformityDuration: "",
      hairGrowth: "",
      pulsesPalpable: "",
      skinTemperature: "",
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showSuccess, setShowSuccess] = useState({
    visible: false,
    type: "save",
    showSubmitOption: false,
    showEditOption: false,
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load data based on whether we're editing or creating a new record
  useEffect(() => {
    if (location.state?.initialData && location.state?.isUpdate) {
      setIsEditMode(true);
      setPatientId(location.state.initialData.patientId);
      const patientData = location.state.initialData.formData;
      if (patientData) {
        console.log("Loading patient data for editing:", patientData);
        const sanitizedData = { ...initialFormState, ...patientData };
        if (sanitizedData.section1.name) {
          delete sanitizedData.section1.name;
        }
        setFormData(sanitizedData);
      }
    } else {
      setIsEditMode(false);
      const saved = localStorage.getItem("stepFormData");
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          if (parsedData.section1.name) {
            delete parsedData.section1.name;
          }
          if (parsedData.section1.consentForm) {
            parsedData.section1.consentForm = null;
            parsedData.section1.consentFormPreview = null;
          }
          setFormData({ ...initialFormState, ...parsedData });
        } catch (error) {
          console.error("Error parsing saved form data:", error);
        }
      }
    }
  }, [location.state]);

  // Fetch patient data if in edit mode or patientId exists
  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientId && isEditMode) {
        try {
          setIsSaving(true);
          const response = await apiGet(`patient/${patientId}`);
          if (response.data) {
            if (response.data.section1.name) {
              delete response.data.section1.name;
            }
            setFormData({ ...initialFormState, ...response.data });
            toast.success("Patient data loaded successfully");
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
          toast.error("Failed to fetch patient data");
        } finally {
          setIsSaving(false);
        }
      }
    };
    fetchPatientData();
  }, [patientId, isEditMode]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (formData.section1.consentFormPreview) {
        URL.revokeObjectURL(formData.section1.consentFormPreview);
      }
      uploadedFiles.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [formData.section1.consentFormPreview, uploadedFiles]);

  // Handle form field changes
  const handleChange = (e, section) => {
    const { name, value, type, checked, files } = e.target;
    const newValue = type === "checkbox" ? checked :
                    type === "radio" ? value :
                    type === "file" ? files[0] :
                    value;

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: newValue
      }
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Define required fields for each step
  const requiredFields = {
    1: [
      "patient_name",
      "age",
      "gender",
      "locality",
      "facilityName",
      "facilityLocation",
      "facilityType",
      "education",
      "occupation",
      "maritalStatus",
      "monthlyIncome",
      "familyMembers",
      "dependents",
      "diabetesType",
      "diabetesDuration",
    ],
    2: [
      "firstAssessment",
      "attendedBefore",
      ...(formData.section2.attendedBefore === "Yes"
        ? ["facilityVisited", "intervalToAssessment", "referredBy", "treatedDays", "referredInDays", "visitedInDays"]
        : []),
      "necrosis",
      ...(formData.section2.necrosis === "Yes" ? ["necrosisPhoto"] : []),
      "gangrene",
      ...(formData.section2.gangrene === "Yes" ? ["gangreneType"] : []),
      "boneExposure",
      "osteomyelitis",
      "sepsis",
      "arterialIssues",
      "infection",
      "swelling",
      "erythema",
      "tenderness",
      "warmth",
      "woundSize",
      "woundLocation",
      "woundDuration",
      "woundClassification",
      "socGiven",
      ...(formData.section2.socGiven === "Yes" ? ["socDetails"] : []),
      "dressingMaterial",
      "offloadingDevice",
      "hospitalization",
      "amputation",
      ...(formData.section2.amputation === "Major" ? ["amputationLevel"] : []),
      "debridementWithAmputation",
      "woundReferenceFile"
    ],
    3: [
      "burningSensation",
      "painWhileWalking",
      "skinChanges",
      "sensationLoss",
      "nailProblems",
      "fungalInfection",
      "skinLesions",
      "openWound",
      "cellulitis",
      "monofilamentLeftA",
      "monofilamentLeftB",
      "monofilamentLeftC",
      "monofilamentRightA",
      "monofilamentRightB",
      "monofilamentRightC",
      "footDeformities",
      "hairGrowth",
      "pulsesPalpable",
      "skinTemperature"
    ],
  };


  useEffect(() => {

    if (location.state?.initialData && location.state?.isUpdate) {

        setIsEditMode(true);

        setPatientId(location.state.initialData.patientId);

        const patientData = location.state.initialData.formData;

        if (patientData) {

            console.log("Loading patient data for editing:", patientData);

            const sanitizedData = { ...initialFormState, ...patientData };

            if (sanitizedData.section1.name) {

                delete sanitizedData.section1.name;

            }

            setFormData(sanitizedData);

        }

    } else {

        setIsEditMode(false);

        const saved = localStorage.getItem("stepFormData");

        if (saved) {

            try {

                const parsedData = JSON.parse(saved);

                if (parsedData.section1.name) {

                    delete parsedData.section1.name;

                }

                if (parsedData.section1.consentForm) {

                    parsedData.section1.consentForm = null;

                    parsedData.section1.consentFormPreview = null;

                }

                setFormData({ ...initialFormState, ...parsedData });

            } catch (error) {

                console.error("Error parsing saved form data:", error);

            }

        }

    }

}, [location.state]);

  // Validate consent form for step 1
  const validateConsentForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.section1.consentUploaded || !formData.section1.consentForm) {
      newErrors.consentForm = "Please upload the signed consent form";
      isValid = false;
    }

    if (!formData.section1.consentVerified) {
      newErrors.consentVerified = "Please verify that you've uploaded the signed consent form";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // Validate current step
  const validateCurrentStep = () => {
    const currentStepFields = requiredFields[step];
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.section1.consentUploaded || !formData.section1.consentForm) {
        newErrors.consentForm = "Please upload the signed consent form";
        isValid = false;
      }
      if (!formData.section1.consentVerified) {
        newErrors.consentVerified = "Please verify the consent form";
        isValid = false;
      }
    }

    if (step === 2) {
      if (!formData.section2.woundReferenceFile) {
        newErrors.woundReferenceFile = "Please upload a wound reference document or image";
        isValid = false;
      }
    }

    currentStepFields.forEach((field) => {
      let fieldValue;
      let section;

      for (const sec in formData) {
        if (formData[sec][field] !== undefined) {
          section = sec;
          fieldValue = formData[sec][field];
          break;
        }
      }

      if (shouldSkipFieldValidation(field)) {
        return;
      }

      if (isRadioField(field)) {
        if (!fieldValue || fieldValue === '') {
          newErrors[field] = "This selection is required";
          isValid = false;
        }
        return;
      }

      if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const shouldSkipFieldValidation = (field) => {
    const conditionalFields = {
      'facilityVisited': formData.section2.attendedBefore !== 'Yes',
      'gangreneType': formData.section2.gangrene !== 'Yes',
      'necrosisPhoto': formData.section2.necrosis !== 'Yes',
      'socDetails': formData.section2.socGiven !== 'Yes',
      'amputationLevel': formData.section2.amputation !== 'Major',
      'deformityDuration': formData.section3.footDeformities !== 'yes'
    };
    
    return conditionalFields[field] === true;
  };

  const isRadioField = (field) => {
    const radioFields = [
      'burningSensation', 'painWhileWalking', 'skinChanges', 'sensationLoss',
      'nailProblems', 'fungalInfection', 'skinLesions', 'openWound', 'cellulitis',
      'monofilamentLeftA', 'monofilamentLeftB', 'monofilamentLeftC',
      'monofilamentRightA', 'monofilamentRightB', 'monofilamentRightC',
      'footDeformities', 'hairGrowth', 'pulsesPalpable', 'skinTemperature'
    ];
    return radioFields.includes(field);
  };

  const validateAllSteps = () => {
    let allValid = true;
    const newErrors = {};

    for (let stepNum = 1; stepNum <= 3; stepNum++) {
      const stepFields = requiredFields[stepNum];
      
      if (stepNum === 1) {
        if (!formData.section1.consentUploaded || !formData.section1.consentForm) {
          newErrors.consentForm = "Please upload the signed consent form";
          allValid = false;
        }
        if (!formData.section1.consentVerified) {
          newErrors.consentVerified = "Please verify the consent form";
          allValid = false;
        }
      } else if (stepNum === 2) {
        if (!formData.section2.woundReferenceFile) {
          newErrors.woundReferenceFile = "Please upload a wound reference document or image";
          allValid = false;
        }
      }

      stepFields.forEach((field) => {
        const fieldValue = formData[`section${stepNum}`][field];
        
        if (shouldSkipFieldValidation(field)) {
          return;
        }

        if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
          newErrors[field] = "This field is required";
          allValid = false;
        }
      });
    }

    setErrors(newErrors);
    return allValid;
  };

  // Prepare FormData for API submission
  const prepareFormDataForAPI = (section) => {
    const formDataObj = new FormData();
    const validFields = Object.keys(initialFormState[section]);

    Object.entries(formData[section]).forEach(([key, value]) => {
      if (!validFields.includes(key)) {
        console.warn(`Ignoring unexpected field in ${section}: ${key}`);
        return;
      }
      if (key.endsWith("Preview") || value === null || value === undefined) {
        return;
      }
      if (value instanceof File) {
        formDataObj.append(key, value);
      } else if (typeof value === 'boolean') {
        formDataObj.append(key, value.toString());
      } else {
        formDataObj.append(key, value);
      }
    });

    if (section === "section2") {
      if (formData.section2.necrosisPhoto instanceof File) {
        formDataObj.append("necrosisPhoto", formData.section2.necrosisPhoto);
      }
      if (formData.section2.woundReferenceFile instanceof File) {
        formDataObj.append("woundReferenceFile", formData.section2.woundReferenceFile);
      }
    }

    return formDataObj;
  };

  // Submit step 1 data
  const submitStep1 = async () => {
    try {
      setIsSaving(true);
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields");
      }

      const formDataToSubmit = prepareFormDataForAPI("section1");
      const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
      formDataToSubmit.append("doctor_id", currentUser?.id || "");
      formDataToSubmit.append("doctor_email", currentUser?.email || "unknown@doctor.com");

      const response = await fetch(`http://127.0.0.1:8000/api/patient/step1`, {
        method: "POST",
        body: formDataToSubmit,
      });

      const data = await response.json();
      if (response.status === 422) {
        const serverErrors = data.errors || {};
        const formattedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(", ") : messages;
        });
        setErrors(formattedErrors);
        throw new Error(formattedErrors.patient_name || "Validation failed. Please check all fields.");
      }

      if (!data.id) {
        throw new Error("No patient ID returned from server");
      }

      setPatientId(data.id);
      toast.success("Step 1 data saved successfully!");
      return data.id;
    } catch (error) {
      console.error("Error submitting step 1:", error);
      toast.error(error.message || "Failed to save step 1 data");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Submit step 2 data
  const submitStep2 = async (id) => {
    try {
      setIsSaving(true);
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields");
      }

      const formDataToSubmit = prepareFormDataForAPI("section2");
      const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
      formDataToSubmit.append("doctor_id", currentUser?.id || "");
      formDataToSubmit.append("doctor_email", currentUser?.email || "unknown@doctor.com");

      const response = await fetch(`http://127.0.0.1:8000/api/patient/step2/${id}`, {
        method: "POST",
        body: formDataToSubmit,
      });

      const data = await response.json();
      if (response.status === 422) {
        const serverErrors = data.errors || {};
        const formattedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(", ") : messages;
        });
        setErrors(formattedErrors);
        throw new Error("Validation failed. Please check all fields.");
      }

      toast.success("Step 2 data saved successfully!");
      return true;
    } catch (error) {
      console.error("Error submitting step 2:", error);
      toast.error(error.message || "Failed to save step 2 data");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Submit step 3 data
  const submitStep3 = async (id) => {
    try {
      setIsSaving(true);
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields");
      }

      const formDataToSubmit = prepareFormDataForAPI("section3");
      const response = await fetch(`http://127.0.0.1:8000/api/patient/step3/${id}`, {
        method: "POST",
        body: formDataToSubmit,
      });

      if (response.status === 422) {
        const data = await response.json();
        const serverErrors = data.errors || {};
        const formattedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(", ") : messages;
        });
        setErrors(formattedErrors);
        throw new Error("Validation failed. Please check all fields.");
      }

      toast.success("Step 3 data saved successfully!");
      return true;
    } catch (error) {
      console.error("Error submitting Step 3:", error);
      toast.error(error.message || "Failed to save Step 3 data");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle next step
  const nextStep = async () => {
    const isValid = validateCurrentStep();
    if (isValid) {
      try {
        if (step === 1 && !isEditMode && !patientId) {
          const newPatientId = await submitStep1();
          setPatientId(newPatientId);
        } else if (step === 2 && patientId) {
          await submitStep2(patientId);
        }

        if (step === 3) {
          setShowSuccess({
            visible: true,
            type: "submit",
            showSubmitOption: true,
            showEditOption: true,
            message: "Step 3 completed! You can now submit the form or edit previous steps.",
          });
          return;
        }

        setStep((prev) => Math.min(prev + 1, 3));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Error moving to next step:", error);
      }
    } else {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  // Handle previous step
  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isValid = validateAllSteps();
      if (!isValid) {
        toast.error("Please fill all required fields");
        return;
      }

      setIsSaving(true);

      if (!patientId) {
        const newPatientId = await submitStep1();
        setPatientId(newPatientId);
        await submitStep2(newPatientId);
        await submitStep3(newPatientId);
      } else {
        if (isEditMode) {
          await submitStep1();
          await submitStep2(patientId);
        }
        await submitStep3(patientId);
      }

      localStorage.removeItem("stepFormData");
      setSubmissionStatus("completed");
      setShowSuccess({
        visible: true,
        type: "submit",
        showSubmitOption: false,
        showEditOption: true,
        message: `Form successfully ${isEditMode ? "updated" : "submitted"}! You can edit the form or return to dashboard.`,
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  // Handle file removal
  const handleRemoveFile = (index) => {
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle consent form download
  const handleDownloadForm = async () => {
    try {
      const pdfPath = "/Consent_form_registry.pdf";
      const link = document.createElement("a");
      link.href = pdfPath;
      link.download = "Diabetes_Foot_Ulcer_Consent_Form.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      handleChange(
        { target: { name: "consentDownloaded", value: true } },
        "section1"
      );
    } catch (error) {
      console.error("Error downloading consent form:", error);
      toast.info("Failed to download consent form. Please contact support.");
    }
  };

  // Handle save for later
  const handleSaveForLater = async () => {
    setIsSaving(true);
    try {
      if (step === 1 && !patientId) {
        const newPatientId = await submitStep1();
        setPatientId(newPatientId);
      } else if (step === 2 && patientId) {
        await submitStep2(patientId);
      } else if (step === 3 && patientId) {
        await submitStep3(patientId);
      }

      const formDataForStorage = JSON.parse(JSON.stringify(formData));
      if (formDataForStorage.section1.consentForm) {
        formDataForStorage.section1.consentForm = null;
        formDataForStorage.section1.consentFormPreview = null;
      }
      if (formDataForStorage.section2.necrosisPhoto) {
        formDataForStorage.section2.necrosisPhoto = null;
        formDataForStorage.section2.necrosisPhotoPreview = null;
      }
      if (formDataForStorage.section2.woundReferenceFile) {
        formDataForStorage.section2.woundReferenceFile = null;
      }

      localStorage.setItem("stepFormData", JSON.stringify(formDataForStorage));
      toast.success("Progress saved successfully!");
      setShowUploadPopup(false);
      navigate("/user/rssdi-save-the-feet-2.0");
    } catch (error) {
      console.error("Error saving for later:", error);
      toast.error(error.message || "Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    localStorage.removeItem("stepFormData");
    setShowUploadPopup(false);
    navigate("/user/rssdi-save-the-feet-2.0");
  };

  // Handle save
  const handleSave = async () => {
    if (validateCurrentStep()) {
      setIsSaving(true);
      try {
        if (step === 1 && !patientId) {
          const newPatientId = await submitStep1();
          setPatientId(newPatientId);
        } else if (step === 2 && patientId) {
          await submitStep2(patientId);
        } else if (step === 3 && patientId) {
          await submitStep3(patientId);
        }

        const formDataForStorage = JSON.parse(JSON.stringify(formData));
        if (formDataForStorage.section1.consentForm) {
          formDataForStorage.section1.consentForm = null;
          formDataForStorage.section1.consentFormPreview = null;
        }
        if (formDataForStorage.section2.necrosisPhoto) {
          formDataForStorage.section2.necrosisPhoto = null;
          formDataForStorage.section2.necrosisPhotoPreview = null;
        }
        if (formDataForStorage.section2.woundReferenceFile) {
          formDataForStorage.section2.woundReferenceFile = null;
        }

        localStorage.setItem("stepFormData", JSON.stringify(formDataForStorage));
        setShowSuccess({
          visible: true,
          type: "save",
          showSubmitOption: false,
          message: "Progress saved successfully!",
        });
        setTimeout(() => {
          setShowSuccess((prev) => ({ ...prev, visible: false }));
        }, 2000);
      } catch (error) {
        console.error("Error saving progress:", error);
        toast.error(error.message || "Failed to save progress. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  // Handle save and continue
  const handleSaveAndContinue = async () => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setIsSaving(true);
    try {
      if (step === 1 && !patientId) {
        const newPatientId = await submitStep1();
        setPatientId(newPatientId);
      } else if (step === 2 && patientId) {
        await submitStep2(patientId);
      }

      const formDataForStorage = JSON.parse(JSON.stringify(formData));
      cleanUpFormData(formDataForStorage);

      localStorage.setItem("stepFormData", JSON.stringify(formDataForStorage));
      toast.success("Progress saved successfully!");

      nextStep();
    } catch (error) {
      console.error("Error saving and continuing:", error);
      toast.error(error.message || "Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Clean up form data
  const cleanUpFormData = (data) => {
    if (data.section1.consentForm) {
      data.section1.consentForm = null;
      data.section1.consentFormPreview = null;
    }
    if (data.section2.necrosisPhoto) {
      data.section2.necrosisPhoto = null;
      data.section2.necrosisPhotoPreview = null;
    }
    if (data.section2.woundReferenceFile) {
      data.section2.woundReferenceFile = null;
    }
  };

  // Handle add new
  const handleAddNew = () => {
    navigate("/user/dashboard");
  };

  // Handle step click
  const handleStepClick = (stepNumber) => {
    if (stepNumber > step) {
      if (!validateCurrentStep()) {
        toast.error("Please complete the current step before moving forward.");
        return;
      }
    }
    setStep(stepNumber);
  };

  // Render step
  const renderStep = () => {
    const stepProps = { formData, handleChange, errors, setErrors };
    switch (step) {
      case 1:
        return <StepForm1 {...stepProps} />;
      case 2:
        return <StepForm2 {...stepProps} />;
      case 3:
        return <StepForm3 {...stepProps} />;
      default:
        return null;
    }
  };

  // Step titles
  const stepTitles = {
    1: {
      default: "Participant Information (baseline)",
      edit: "Edit Participant Information (baseline)",
    },
    2: {
      default: "Details of Active Ulcer and its Treatment",
      edit: "Edit Details of Active Ulcer and its Treatment",
    },
    3: {
      default: "3-Minute Foot Examination",
      edit: "Edit 3-Minute Foot Examination",
    },
  };

  return (
    <FormLayout>
      <div className="step-form-container">
        <div className="form-header">
          <h2 className="form-title">{isEditMode ? stepTitles[step].edit : stepTitles[step].default}</h2>
          <button type="button" onClick={handleAddNew} className="dashboard-btn" aria-label="Go back to dashboard">
            <ArrowLeftToLine size={18} />
            <span>Dashboard</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="step-progress-container">
            <div className="step-progress-bar">
              <div className="step-progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
            <div className="step-indicator">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`step-item ${step >= stepNumber ? "active" : ""} ${step > stepNumber ? "completed" : ""}`}
                  onClick={() => handleStepClick(stepNumber)}
                >
                  <div className="step-number">
                    {step > stepNumber ? (
                      <svg viewBox="0 0 24 24" className="check-icon">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className="step-label">
                    {stepNumber === 1 && "Step 1"}
                    {stepNumber === 2 && "Step 2"}
                    {stepNumber === 3 && "Step 3"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-step-content">{renderStep()}</div>

          <div className="step-form-actions">
            <div className="action-buttons stepform-actions">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="prev-btn"
                  aria-label="Go to previous step"
                  disabled={isSaving}
                >
                  <ArrowLeftToLine size={18} />
                  <span>Previous</span>
                </button>
              )}

              {step < 3 && (
                <button
                  type="button"
                  onClick={handleSaveAndContinue}
                  className={`save-continue-btn ${isSaving ? "saving" : ""}`}
                  aria-label="Save and continue to next step"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingOutlined style={{ marginRight: 8 }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save & Continue</span>
                    </>
                  )}
                </button>
              )}

              {step === 3 && (
                <button
                  type="submit"
                  className="submit-btn"
                  aria-label="Submit form"
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingOutlined style={{ marginRight: 8 }} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Form</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {showUploadPopup && (
          <UploadPopup
            onClose={() => setShowUploadPopup(false)}
            handleFileUpload={handleFileUpload}
            handleDownloadForm={handleDownloadForm}
            uploadedFiles={uploadedFiles}
            handleRemoveFile={handleRemoveFile}
            handleSaveForLater={handleSaveForLater}
            handleUploadComplete={handleUploadComplete}
            isSaving={isSaving}
          />
        )}

        <SuccessPopup
          visible={showSuccess.visible}
          onClose={() => setShowSuccess({ ...showSuccess, visible: false })}
          type={showSuccess.type}
          showSubmitOption={showSuccess.showSubmitOption}
          showEditOption={showSuccess.showEditOption}
          message={showSuccess.message}
          onContinueToSubmit={() => {
            setShowSuccess({ ...showSuccess, visible: false });
            const event = { preventDefault: () => {} };
            handleSubmit(event);
          }}
          onEdit={() => {
            setShowSuccess({ ...showSuccess, visible: false });
            setIsEditMode(true);
            setStep(1); // Go back to step 1 for editing
          }}
          onReturnToDashboard={() => {
            setShowSuccess({ ...showSuccess, visible: false });
            navigate("/user/rssdi-save-the-feet-2.0", {
              state: {
                showToast: true,
                toastMessage: `Patient assessment ${isEditMode ? "updated" : "completed"}`,
              },
              replace: true,
            });
          }}
        />
      </div>
    </FormLayout>
  );
};

export default StepForm;