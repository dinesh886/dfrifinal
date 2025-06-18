"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useRef } from "react"
import FormLayout from "../../../layouts/FormLayout"
import "./StepForm.css"
import StepForm1 from "./StepForm1"
import StepForm2 from "./StepForm2"
import StepForm3 from "./StepForm3"
import { ArrowLeftToLine, Send, Save } from "lucide-react"
import { LoadingOutlined } from "@ant-design/icons"
import UploadPopup from "../../../components/UploadPopup"
import SuccessPopup from "../../../components/SuccessPopup"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { apiGet } from "../../../services/api-helper"
import { IMAGE_BASE_URL } from "../../../config/api"

const StepForm = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [submissionStatus, setSubmissionStatus] = useState(null)
  const [patientId, setPatientId] = useState(null)
  const [step, setStep] = useState(1)
  const step1SubmittedRef = useRef(false)

  const [selectedTest, setSelectedTest] = useState("");

  const initialFormState = {
    section1: {
      patient_name: "",
      consentForm: "",
      consentFormPreview: "",
      consentDownloaded: "",
      consentUploaded: "no",
      consentVerified: "no",
      // address: "",
      locality: "",
      villageOrCity: "",
      state: "",
      pincode: "",
      treatmentType:"",
      facilityEmail:"",
      age: "",
      gender: "",
      facilityName: "",
      facilityLocation: "",
      facilityType: "",
      education: "",
      occupation: "",
      maritalStatus: "",
      // monthlyIncome: "",
      sesRating: null, // Changed from "" to null
      familyMembers: "",
      dependents: "",
      diabetesType: "",
      diabetesDuration: "",
      hasUlcer: "",
      ulcerDuration: "",
      hasAmputation: "",
      amputationDuration: "",
      hasAngioplasty: "",
      angioplastyDuration: "",
      smoking: "",
      alcohol: "",
      tobacco: "",
      renal: "",
      retinal: "",
      cardiovascular: "",
      cerebrovascular: "",
      // imbIschemia: "",
      hypertension: "",

      heartFailure: "", // Added

      limbIschemia: "", // Added

      wearShoes: "", // Added
      wearSlippers: "", // Added
      walkOnSand: "", // Added
      washFeet: "", // Added
      fastingGlucose: "", // Added
      postPrandialGlucose: "", // Added
      hba1c: "", // Added
      totalCholesterol: "", // Added
      triglycerides: "", // Added
      hdl: "", // Added
      ldl: "", // Added
      vldl: "", // Added
      renalDuration: "",
      retinalDuration: "",
      cardiovascularDuration: "",
      heartFailureDuration: "",
      cerebrovascularDuration: "",
      limbIschemiaDuration: "",

      hypertensionDuration: "",
      serumCreatinine: "", // Added
    },
    section2: {
      // onsetFootUlcer :"",
      // firstTreatmentDate:"",
      firstAssessment: "",
      // attendedBefore: "",
      // facilityVisited: "",
      // intervalToAssessment: "",
      // referredBy: "",
      // treatedDays: "",
      // referredInDays: "",
      // visitedInDays: "",
      necrosis: "",
     
      leg:"",
      foot:"",
      rightFoot_forefoot:"",
      rightFoot_hindfoot:"",
      rightFoot_midfoot:"",
      leftFoot_forefoot:"",
      leftFoot_hindfoot:"",
      leftFoot_midfoot:"",
      // necrosisPhoto: "",
      purulentDischarge:"",
      // necrosisPhotoPreview: "",
      gangrene: "",
      gangreneType: "",
      probetobone: "",
      osteomyelitis: "",
      sepsis: "",
      arterialIssues: "",
      infection: "",
      swelling: "",
      erythema: "",
      tenderness: "",
      warmth: "",
   
      cultureReport: "",
      cultureReportPreview: "",
      woundSize: "",
      // woundLocation: "",
      woundDuration: "",
      // woundClassification: "",
      socGiven: "",
      socDetails: "",
      dressingMaterial: "",
      offloadingDevice: "",
      // hospitalization: "",
      amputation: "",
      amputationType: "",
      amputationLevel: "",
      // debridementWithAmputation: "",
      antibioticsGiven:"",
      
      woundReferenceFile: "",
      woundReferenceFilePreview: "",
      woundReferenceConsent: "",
    
      cultureReportAvailable: "",
      arterialReport: "",
      cultureReportPreview:"",
      arterialReportPreview: "",
    

      
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
      // cellulitis: "",

      testType : "",

      monofilamentLeftA: "",
      monofilamentLeftB: "",
      monofilamentLeftC: "",
      monofilamentRightA: "",
      monofilamentRightB: "",
      monofilamentRightC: "",

      tuningForkRightMedialMalleolus: "",
      tuningForkRightLateralMalleolus: "",
      tuningForkRightBigToe: "",

      tuningForkLeftMedialMalleolus:"",
      tuningForkLeftLateralMalleolus:"",
      tuningForkLeftBigToe:"",

      footDeformities: "",
      deformityDuration: "",
      hairGrowth: "",
      pulsesPalpable: "",
      skinTemperature: "",
      // ulcerPresence: "",
   
      // footImage: "",
      // footImagePreview: "",
   
    },
  }
  
  const [formData, setFormData] = useState(initialFormState)
  const [editedFields, setEditedFields] = useState({
    section1: {},
    section2: {},
    section3: {},
  })
  const [showSuccess, setShowSuccess] = useState({
    visible: false,
    type: "save",
    showSubmitOption: false,
    showEditOption: false,
    message: "",
  })
  const [errors, setErrors] = useState({})
  const [showUploadPopup, setShowUploadPopup] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Map flat API data to nested form structure with fallback

  // const convertToYesNo = (value) => {
  //   // Check for null or undefined first
  //   if (value === null || value === undefined) return ""

  //   // Convert to string for consistent comparison
  //   const strValue = String(value).toLowerCase().trim()

  //   // Check for various "yes" representations
  //   if (strValue === "yes" || strValue === "1" || strValue === "true" || value === 1 || value === true) {
  //     return "yes"
  //   }

  //   // Check for various "no" representations
  //   if (strValue === "no" || strValue === "0" || strValue === "false" || value === 0 || value === false) {
  //     return "no"
  //   }

  //   // Return empty string if no match
  //   return ""
  // }
  const isRadioField = (field) => {
    const radioFields = [
      // Section 1
    
      "hasUlcer", "hasAngioplasty",
      "renal", "retinal", "cardiovascular", "cerebrovascular", "hypertension", "limbIschemia",

      // Section 2
      "necrosis", "gangrene", "sepsis",
      "arterialIssues", "swelling", "erythema",
      "tenderness", "warmth", 

      // Section 3
      "burningSensation", "painWhileWalking", "skinChanges", "sensationLoss",
      "nailProblems", "fungalInfection", "skinLesions", "openWound", 
      //"cellulitis", "monofilamentLeftA", "monofilamentLeftB", "monofilamentLeftC",
      // "monofilamentRightA", "monofilamentRightB", "monofilamentRightC",
      "footDeformities", "hairGrowth", "pulsesPalpable", 
    ];
    return radioFields.includes(field);
  };

  const mapFlatToNested = (flatData) => {
    console.log("Flat API Data:", flatData);
    

    const nestedData = JSON.parse(JSON.stringify(initialFormState));
    console.log("Image field values in flatData:", {
      consentForm: flatData.consentForm || flatData.consent_form,
      necrosisPhoto: flatData.necrosisPhoto || flatData.necrosis_photo,
      woundReferenceFile: flatData.woundReferenceFile || flatData.wound_reference_file,
      arterialReport: flatData.arterialReport || flatData.arterial_report,
      cultureReport: flatData.cultureReport || flatData.culture_report,
      footImage: flatData.footImage || flatData.foot_image,
    });
    console.log("Preview path set to:", nestedData.section1.consentFormPreview);
    console.log("Image field values in flatData:", {
      
      cultureReport: flatData.cultureReport || flatData.culture_report,
    });
    // Add these checks to identify where the preview might be getting lost:
   
    const fieldMappings = {
      section1: {
        hasUlcer: ["hasUlcer", "has_ulcer"],
        // hasAmputation: ["hasAmputation", "has_amputation"],
        hasAngioplasty: ["hasAngioplasty", "has_angioplasty"],
        renal: ["renal"],
        retinal: ["retinal"],
        cardiovascular: ["cardiovascular"],
        cerebrovascular: ["cerebrovascular"],
        // imbIschemia: ["imbIschemia", "imb_ischemia"],
        hypertension: ["hypertension"],
        consentDownloaded: ["consentDownloaded", "consent_downloaded"],
        consentUploaded: ["consentUploaded", "consent_uploaded"],
        consentVerified: ["consentVerified", "consent_verified"],
        limbIschemia: ["limbIschemia", "limb_ischemia"],
      
        consentForm: ["consentForm", "consent_form"],
        arterialReport: ["arterialReport", "arterial_report"],
       
        woundReferenceFile: ["woundReferenceFile", "wound_reference_file"],
      },
      section2: {
        necrosis: ["necrosis"],
        gangrene: ["gangrene"],
        // probetobone: ["probetobone", "bone_exposure"],
        // osteomyelitis: ["osteomyelitis"],
        sepsis: ["sepsis"],
        arterialIssues: ["arterialIssues", "arterial_issues"],
        // infection: ["infection"],
        // swelling: ["swelling"],
        // erythema: ["erythema"],
        // tenderness: ["tenderness"],
        // warmth: ["warmth"],
    
        necrosisPhoto: ["necrosisPhoto", "necrosis_photo"],
        cultureReport: ["cultureReport", "culture_report"],
        woundReferenceFile: ["woundReferenceFile", "wound_reference_file"],
      },
      section3: {
        burningSensation: ["burningSensation", "burning_sensation"],
        painWhileWalking: ["painWhileWalking", "pain_while_walking"],
        skinChanges: ["skinChanges", "skin_changes"],
        sensationLoss: ["sensationLoss", "sensation_loss"],
        nailProblems: ["nailProblems", "nail_problems"],
        fungalInfection: ["fungalInfection", "fungal_infection"],
        skinLesions: ["skinLesions", "skin_lesions"],
        openWound: ["openWound", "open_wound"],
        // cellulitis: ["cellulitis"],
        monofilamentLeftA: ["monofilamentLeftA", "monofilament_left_a"],
        monofilamentLeftB: ["monofilamentLeftB", "monofilament_left_b"],
        monofilamentLeftC: ["monofilamentLeftC", "monofilament_left_c"],
        monofilamentRightA: ["monofilamentRightA", "monofilament_right_a"],
        monofilamentRightB: ["monofilamentRightB", "monofilament_right_b"],
        monofilamentRightC: ["monofilamentRightC", "monofilament_right_c"],
        tuningForkRightMedialMalleolus: ["tuningForkRightMedialMalleolus", "tuning_fork_right_medial_malleolus"],
        tuningForkRightLateralMalleolus: ["tuningForkRightLateralMalleolus", "tuning_fork_right_lateral_malleolus"],
        tuningForkRightBigToe: ["tuningForkRightBigToe", "tuning_fork_right_big_toe"],
        tuningForkLeftMedialMalleolus: ["tuningForkLeftMedialMalleolus", "tuning_fork_left_medial_malleolus"],
        tuningForkLeftLateralMalleolus: ["tuningForkLeftLateralMalleolus", "tuning_fork_left_lateral_malleolus"],
        tuningForkLeftBigToe: ["tuningForkLeftBigToe", "tuning_fork_left_big_toe"],
        footDeformities: ["footDeformities", "foot_deformities"],
        hairGrowth: ["hairGrowth", "hair_growth"],
        pulsesPalpable: ["pulsesPalpable", "pulses_palpable"],
        skinTemperature: ["skinTemperature", "skin_temperature"],
        // ulcerPresence: ["ulcerPresence", "ulcer_presence"],
      
      
        footImage: ["footImage", "foot_image"],
      },
    };
    console.log("Preview path set to:", nestedData.section2.woundReferenceFilePreview);
    const imageFields = [
      "consentForm",
      "necrosisPhoto",
      "woundReferenceFile",
      "woundReferenceConsent",
      "arterialReport",
      "cultureReport",
      "footImage"
    ];

    Object.keys(nestedData).forEach((section) => {
      Object.keys(nestedData[section]).forEach((field) => {
        if (field.endsWith("Preview")) return;

        const isBooleanField = isRadioField(field);
        let value;

        if (fieldMappings[section]?.[field]) {
          for (const variant of fieldMappings[section][field]) {
            if (flatData[variant] !== undefined) {
              value = flatData[variant];
              break;
            }
          }
        } else {
          value = flatData[field];
        }

        if (value !== undefined && value !== null) {
          if (isBooleanField) {
            nestedData[section][field] = convertToYesNo(value);
          } else if (imageFields.includes(field)) {
            nestedData[section][field] = value || "";
            const previewField = `${field}Preview`;
            if (nestedData[section].hasOwnProperty(previewField)) {
              if (value && typeof value === 'string' && value.trim() !== '') {
                const isPdf = value.toLowerCase().endsWith('.pdf');
                nestedData[section][previewField] = isPdf
                  ? `${IMAGE_BASE_URL}${value}`
                  : `${IMAGE_BASE_URL}${value}`;
              } else {
                nestedData[section][previewField] = '/pdf-icon.png'; // Fallback for empty/invalid values
              }
            }
            // Set consentFormName for edit mode
            if (field === "consentForm" && value && typeof value === 'string' && value.trim() !== '') {
              nestedData[section].consentFormName = value.split('/').pop() || 'consent_form.pdf';
            } else if (field === "consentFormName" && value && typeof value === 'string') {
              nestedData[section].consentFormName = value || 'consent_form.pdf';
            }
          } else {
            nestedData[section][field] = String(value);
          }
        } else {
          // Handle null/undefined values
          nestedData[section][field] = "";
          if (field === "consentFormName") {
            nestedData[section].consentFormName = 'consent_form.pdf';
          }
          if (imageFields.includes(field)) {
            const previewField = `${field}Preview`;
            if (nestedData[section].hasOwnProperty(previewField)) {
              nestedData[section][previewField] = '/pdf-icon.png';
            }
          }
        }
      });
    });

    console.log("Mapped Nested Data:", nestedData);
    return nestedData;
  }
  
  
  const convertToYesNo = (value) => {
    if (value === true || value === 1 || value === "1" || value === "yes") return "yes";
    if (value === false || value === 0 || value === "0" || value === "no") return "no";
    return "";
  };
  

  // Load data for edit or new record
  useEffect(() => {
    const loadData = async () => {
      if (location.state?.initialData && location.state?.isUpdate) {
        setIsEditMode(true)
        setPatientId(location.state.initialData.patientId)

        try {
          setIsSaving(true)
          // Try to fetch fresh data first
          const response = await apiGet(`patient/${location.state.initialData.patientId}`)
          console.log("API Response:", response)

          // Merge API data with initialData from navigation
          const initialData = location.state?.initialData?.formData || location.state?.initialData || {}
          const mergedData = {
            ...(response.patient || {}),
            ...initialData,
          }

          const nestedData = mapFlatToNested(mergedData)
          setFormData(nestedData)
        } catch (error) {
          console.error("Error fetching patient data:", error)
          // Fallback to initialData if API fails
          const initialData = location.state?.initialData?.formData || location.state?.initialData
          if (initialData) {
            const nestedData = mapFlatToNested(initialData)
            setFormData(nestedData)
          }
        } finally {
          setIsSaving(false)
        }
      } else {
        // Handle new form case
        setIsEditMode(false)
        const saved = localStorage.getItem("stepFormData")
        if (saved) {
          try {
            const parsedData = JSON.parse(saved)
            setFormData({ ...initialFormState, ...parsedData })
          } catch (error) {
            console.error("Error parsing saved form data:", error)
          }
        }
      }
    }

    loadData()
  }, [location.state])
  // Fetch patient data for edit mode
  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientId && isEditMode) {
        try {
          setIsSaving(true)
          const response = await apiGet(`patient/${patientId}`)
          console.log("API Response for patient:", response)

          // Merge API data with initialData from navigation
          const initialData = location.state?.initialData?.formData || location.state?.initialData || {}
          let mergedData

          if (response.patient) {
            // Create a flattened object with all possible field names
            mergedData = {
              ...response.patient,
              ...initialData,
            }

            // Add snake_case versions of all fields to ensure we catch all variations
            Object.keys(mergedData).forEach((key) => {
              if (key.includes("_")) {
                // Convert snake_case to camelCase
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
                if (mergedData[camelKey] === undefined) {
                  mergedData[camelKey] = mergedData[key]
                }
              } else if (/[A-Z]/.test(key)) {
                // Convert camelCase to snake_case
                const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
                if (mergedData[snakeKey] === undefined) {
                  mergedData[snakeKey] = mergedData[key]
                }
              }
            })

            console.log("Merged Data (API + initialData):", mergedData)
          } else {
            console.warn("No patient data from API, using initialData:", initialData)
            mergedData = {
              ...initialData,
            }
          }

          const nestedData = mapFlatToNested(mergedData)
          console.log("Final nested data for form:", nestedData)
          setFormData(nestedData)
          toast.success("Patient data loaded successfully")
        } catch (error) {
          console.error("Error fetching patient data:", error)
          const initialData = location.state?.initialData?.formData || location.state?.initialData
          if (initialData) {
            console.warn("Error fetching API data, using initialData:", initialData)
            const nestedData = mapFlatToNested(initialData)
            setFormData(nestedData)
            toast.warn("Loaded data from initial input due to API error")
          } else {
            toast.error("Failed to fetch patient data")
          }
        } finally {
          setIsSaving(false)
        }
      }
    }
    fetchPatientData()
  }, [patientId, isEditMode, location.state])

  // Add debug logging to help identify issues with field mapping
  useEffect(() => {
    if (formData !== initialFormState) {
      console.log("Current form data:", formData)

      // Log all boolean fields to check their values
      const booleanFields = {
        section1: [
          "hasUlcer",
          
          "hasAngioplasty",
          "renal",
          "retinal",
          "cardiovascular",
          "cerebrovascular",
          // "imbIschemia",
          "hypertension",
          "limbIschemia",
        ],
        section2: [
          "necrosis",
          "gangrene",
          // "probetobone",
          // "osteomyelitis",
          "sepsis",
          "arterialIssues",
          // "infection",
          "swelling",
          "erythema",
          "tenderness",
          "warmth",
         
          "cultureReportAvailable",
        ],
        section3: [
          "burningSensation",
          "painWhileWalking",
          "skinChanges",
          "sensationLoss",
          "nailProblems",
          "fungalInfection",
          "skinLesions",
          "openWound",
          // "cellulitis",
          "footDeformities",
          "hairGrowth",
          "pulsesPalpable",
          // "ulcerPresence",
          // "cultureReportAvailable",
        ],
      }

      Object.entries(booleanFields).forEach(([section, fields]) => {
        console.log(`Boolean fields in ${section}:`)
        fields.forEach((field) => {
          console.log(`  ${field}: "${formData[section][field]}"`)
        })
      })
    }
  }, [formData])

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (formData.section1.consentFormPreview) {
        URL.revokeObjectURL(formData.section1.consentFormPreview)
      }
      uploadedFiles.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
    }
  }, [formData.section1.consentFormPreview, uploadedFiles])

  // Handle form field changes and track edited fields
  const handleChange = (e, section) => {
    const { name, value, type, checked, files } = e.target;
  
    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "radio") {
      newValue = value;
    } else if (type === "file") {
      newValue = files[0];
    } else {
      // Convert `sesRating` to number if matched
      newValue = name === "sesRating" ? Number(value) : value;
    }
  
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: newValue,
      },
    }));
  
    setEditedFields((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: newValue,
      },
    }));
  
    if (errors[name]) {
      setErrors((prev) => {
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
      // "facilityEmail",
      // "locality",
      // "facilityName",
      // "facilityLocation",
      // "facilityType",
      "treatmentType",
      "education",
      "occupation",
      "maritalStatus",
      // "monthlyIncome",
      "sesRating",
      "familyMembers",
      "dependents",
      "diabetesType",
      "diabetesDuration",
     
      "hasUlcer",
      "hasAmputation",
      "hasAngioplasty",
      "renal",
      // ...(formData.section1.renal?.toLowerCase() === "yes" ? ["renalDuration"] : []),

      "retinal",
      // ...(formData.section1.retinal.toLowerCase() === "yes" ? ["retinalDuration"] : []),
      "cardiovascular",
      // ...(formData.section1.cardiovascular.toLowerCase() === "yes" ? ["cardiovascularDuration"] : []),
      "heartFailure",
      // ...(formData.section1.heartFailure.toLowerCase() === "yes" ? ["heartFailureDuration"] : []),
      "cerebrovascular",
      // ...(formData.section1.cerebrovascular.toLowerCase() === "yes" ? ["cerebrovascularDuration"] : []),
      "limbIschemia",
      // ...(formData.section1.limbIschemia.toLowerCase() === "yes" ? ["limbIschemiaDuration"] : []),
      "hypertension",
      // ...(formData.section1.hypertension.toLowerCase() === "yes" ? ["hypertensionDuration"] : []),
      "smoking",
      "alcohol",
      "tobacco",
      "wearShoes",
      "wearSlippers",
      "walkOnSand",
      "washFeet",
      "fastingGlucose",
      "postPrandialGlucose",
      "hba1c",
      // "totalCholesterol",
      // "triglycerides",
      // "hdl",
      // "ldl",
      // "vldl",
      "serumCreatinine"
    ],
    2: [
      // "onsetFootUlcer",
      // "firstTreatmentDate",
      "firstAssessment",
      // "attendedBefore",
      // ...(formData.section2.attendedBefore.toLowerCase() === "yes"
      //   ? ["facilityVisited", "intervalToAssessment", "referredBy", "treatedDays", "referredInDays", "visitedInDays"]
      //   : []),
      // "necrosis",
      // ...(formData.section2.necrosis === "Yes" ? ["necrosisPhoto"] : []),
      "gangrene",
      ...(formData.section2.gangrene.toLowerCase() === "yes" ? ["gangreneType"] : []),
      "probetobone",
      "osteomyelitis",
      "sepsis",
      "arterialIssues",
      "infection",
      "swelling",
      "erythema",
      "tenderness",
      "warmth",
      "necrosis",
      "purulentDischarge",
      "antibioticsGiven",
     "leg",
"foot",

// Conditionally require foot sections based on selected foot
...(formData.section2.foot === 'right' || formData.section2.foot === 'both' ? [
  'rightFoot_forefoot',
  'rightFoot_hindfoot',
  'rightFoot_midfoot'
] : []),

...(formData.section2.foot === 'left' || formData.section2.foot === 'both' ? [
  'leftFoot_forefoot',
  'leftFoot_hindfoot',
  'leftFoot_midfoot'
] : []),
      // "cultureReport",
      "cultureReportAvailable",
      "woundSize",
      // "woundLocation",
      "woundDuration",
      // "woundClassification",
      "socGiven",
      ...(formData.section2.socGiven === "Yes" ? ["socDetails"] : []),
      "dressingMaterial",
      "offloadingDevice",
      // "hospitalization",
      "amputation",
      
    ],
    // ...(formData.section2.amputation === "Major" ? ["amputationLevel"] : []),
    //   "debridementWithAmputation",
    3: [
      "burningSensation",
      "painWhileWalking",
      "skinChanges",
      "sensationLoss",
      "nailProblems",
      "fungalInfection",
      "skinLesions",
      "openWound",
      // "cellulitis",

      // "monofilament",
      // "tuningFork",

      // "monofilamentLeftA",
      // "monofilamentLeftB",
      // "monofilamentLeftC",
      // "monofilamentRightA",
      // "monofilamentRightB",
      // "monofilamentRightC",

      // "tuningForkRightMedialMalleolus",
      // "tuningForkRightLateralMalleolus",
      // "tuningForkRightBigToe",

      // "tuningForkLeftMedialMalleolus",
      // "tuningForkLeftLateralMalleolus",
      // "tuningForkLeftBigToe",

      "footDeformities",
      "hairGrowth",
      "pulsesPalpable",
      "skinTemperature",

      // Removed deformityDuration from unconditional required fields
      ...(formData.section3.footDeformities === "yes" ? ["deformityDuration"] : []),
      "testType", // This is always required
      // Conditionally require monofilament fields ONLY if monofilament test is selected
      ...(formData.section3.testType === "monofilament"
        ? [
          "monofilamentLeftA",
          "monofilamentLeftB",
          "monofilamentLeftC",
          "monofilamentRightA",
          "monofilamentRightB",
          "monofilamentRightC"
        ]
        : []),

      // Conditionally require tuning fork fields ONLY if tuning fork test is selected
      ...(formData.section3.testType === "tuningFork"
        ? [
          "tuningForkRightMedialMalleolus",
          "tuningForkRightLateralMalleolus",
          "tuningForkRightBigToe",
          "tuningForkLeftMedialMalleolus",
          "tuningForkLeftLateralMalleolus",
          "tuningForkLeftBigToe"
        ]
        : [])
    ],
  }

  // Validate consent form for step 1
  // const validateConsentForm = () => {
  //   const newErrors = {}
  //   let isValid = true

  //   if (!formData.section1.consentUploaded || !formData.section1.consentForm) {
  //     newErrors.consentForm = "Please upload the signed consent form"
  //     isValid = false
  //   }

  //   if (!formData.section1.consentVerified) {
  //     newErrors.consentVerified = "Please verify that you've uploaded the signed consent form"
  //     isValid = false
  //   }

  //   setErrors((prev) => ({ ...prev, ...newErrors }))
  //   return isValid
  // }

  // Validate current step
  // Update validateCurrentStep
  const validateCurrentStep = () => {
    const currentStepFields = requiredFields[step];
    const newErrors = {};
    let isValid = true;

    console.log(`Validating Step ${step} fields:`, currentStepFields);
    console.log(`Validating Step ${step} fields:`, currentStepFields);
    // if (step === 1) {
    //   if (!formData.section1.consentUploaded || !formData.section1.consentForm) {
    //     newErrors.consentForm = 'Please upload the signed consent form';
    //     isValid = false;
    //   }
    //   if (!formData.section1.consentVerified) {
    //     newErrors.consentVerified = 'Please verify the consent form';
    //     isValid = false;
    //   }
    // }

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
        console.log(`Skipping validation for ${field}`);
        return;
      }

      if (isRadioField(field)) {
        if (!fieldValue || fieldValue === '') {
          newErrors[field] = 'This selection is required';
          isValid = false;
          console.log(`Validation failed for radio field ${field}: value="${fieldValue}"`);
        }
        return;
      }

      if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
        newErrors[field] = 'This field is required';
        isValid = false;
        console.log(`Validation failed for field ${field}: value="${fieldValue}"`);
      }
      
    });

    console.log('Validation errors:', newErrors);
    console.log('Form data for step:', formData[`section${step}`]);

    setErrors(newErrors);
    return isValid;
  };

  // Update shouldSkipFieldValidation
  const shouldSkipFieldValidation = (field) => {
    const conditionalFields = {
      facilityVisited: !['Yes', 'yes'].includes(formData.section2.attendedBefore),
      gangreneType: !['Yes', 'yes'].includes(formData.section2.gangrene),
      necrosisPhoto: !['Yes', 'yes'].includes(formData.section2.necrosis),
      socDetails: !['Yes', 'yes'].includes(formData.section2.socGiven),
      amputationLevel: formData.section2.amputation !== 'Major',
      deformityDuration: !['yes', 'Yes'].includes(formData.section3.footDeformities),
    };
    return conditionalFields[field] === true;
  };

  // Validate all steps
  const validateAllSteps = () => {
    let allValid = true
    const newErrors = {}
    const missingFieldsByStep = { 1: [], 2: [], 3: [] } // Track missing fields for logging

    for (let stepNum = 1; stepNum <= 3; stepNum++) {
      const stepFields = requiredFields[stepNum]

      // if (stepNum === 1) {
      //   if (!formData.section1.consentUploaded || !formData.section1.consentForm) {
      //     newErrors.consentForm = "Please upload the signed consent form"
      //     missingFieldsByStep[1].push("consentForm")
      //     allValid = false
      //   }
      //   if (!formData.section1.consentVerified) {
      //     newErrors.consentVerified = "Please verify the consent form"
      //     missingFieldsByStep[1].push("consentVerified")
      //     allValid = false
      //   }
      // }

      stepFields.forEach((field) => {
        const fieldValue = formData[`section${stepNum}`][field]

        if (shouldSkipFieldValidation(field)) {
          console.log(`Skipping validation for ${field} in step ${stepNum}`)
          return
        }

        if (fieldValue === "" || fieldValue === null || fieldValue === undefined) {
          newErrors[field] = "This field is required"
          missingFieldsByStep[stepNum].push(field)
          allValid = false
        }
      })
    }

    // Log missing fields for debugging
    console.log("Validation Results for All Steps:")
    Object.entries(missingFieldsByStep).forEach(([step, fields]) => {
      if (fields.length > 0) {
        console.log(`Step ${step} Missing Fields:`, fields)
      } else {
        console.log(`Step ${step}: All required fields filled`)
      }
    })
    console.log("Errors Set:", newErrors)
    console.log("Current Form Data:", JSON.parse(JSON.stringify(formData)))

    setErrors(newErrors)

    // If validation fails, scroll to the first error in Step 3 if it's the current step
    if (!allValid && step === 3) {
      const firstErrorField = missingFieldsByStep[3][0]
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }

    return allValid
  }
  // Prepare FormData for API submission, limited to specified step
  const prepareFormDataForAPI = (step) => {
    const formDataObj = new FormData()
    const section = `section${step}`
    const validFields = Object.keys(initialFormState[section])

    // Include ALL fields for the current section
    Object.entries(formData[section]).forEach(([key, value]) => {
      if (!validFields.includes(key)) {
        console.warn(`Ignoring unexpected field in ${section}: ${key}`)
        return
      }

      // Skip preview fields and null values
      if (key.endsWith("Preview") || value === null || value === undefined) {
        return
      }

      // Special handling for radio fields in Step 1 TO 3
      if (isRadioField(key)) {
        formDataObj.append(key, value === "yes" ? "1" : "0")
        return
      }

      // Handle all other value types
      if (value instanceof File) {
        formDataObj.append(key, value)
      } else if (typeof value === "boolean") {
        formDataObj.append(key, value.toString())
      } else {
        // Convert other types to string
        formDataObj.append(key, String(value))
      }
    })

    // Add user info
    const currentUser = JSON.parse(sessionStorage.getItem("userInfo") || {})
    formDataObj.append("doctor_id", currentUser?.id || "")
    formDataObj.append("doctor_email", currentUser?.email || "unknown@doctor.com")

    if (isEditMode && patientId) {
      formDataObj.append("id", patientId)
    }

    // Debug log
    console.log(`FormData Entries for Step ${step}:`)
    for (const [key, value] of formDataObj.entries()) {
      console.log(`${key}:`, value instanceof File ? `[File: ${value.name}]` : value)
    }

    return formDataObj
  }
  // Submit step 1 data
  const submitStep1 = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields")
      }

      console.log("Submitting Step 1 data for patient ID:", patientId)
      const formDataToSubmit = prepareFormDataForAPI(1)
      const url =
        isEditMode && patientId
          ? `https://webstrategy.co.in/rssdi/api/patient/updatestep1/${patientId}`
          : `https://webstrategy.co.in/rssdi/api/patient/step1`
      const response = await fetch(url, {
        method: "POST",
        body: formDataToSubmit,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.message || "Unknown error"}`)
      }

      const data = await response.json()
      console.log("Step 1 API Response:", data)
      const newPatientId = data.id || data.patientId || data.data?.id
      if (!newPatientId && !isEditMode) {
        throw new Error("Server didn't return a patient ID.")
      }

      if (!isEditMode) {
        setPatientId(newPatientId)
      }
      toast.success("Step 1 data saved successfully!")
      return newPatientId
    } catch (error) {
      console.error("Error submitting step 1:", error)
      toast.error(error.message || "Failed to save step 1 data")
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Submit step 2 data
  // Update submitStep2 with logging
  const submitStep2 = async (id) => {
    try {
      setIsSaving(true);
      if (!validateCurrentStep()) {
        throw new Error('Please fill all required fields');
      }

      console.log(`Submitting Step 2 data for patient ID: ${id}`);
      console.log('Step 2 formData:', formData.section2);

      const formDataToSubmit = prepareFormDataForAPI(2);
      const response = await fetch(`https://webstrategy.co.in/rssdi/api/patient/step2/${id}`, {
        method: 'POST',
        body: formDataToSubmit,
      });

      const data = await response.json();
      console.log('Step 2 API Response:', data);

      if (!response.ok) {
        const serverErrors = data.errors || {};
        const errorMessage = data.message || 'Failed to save Step 2 data';
        const formattedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(', ') : messages;
        });
        setErrors(formattedErrors);
        console.log('Server validation errors:', formattedErrors);
        throw new Error(`Validation failed: ${errorMessage}`);
      }

      toast.success('Step 2 data saved successfully!');
      return true;
    } catch (error) {
      console.error('Error submitting step 2:', error);
      toast.error(error.message || 'Failed to save step 2 data. Please try again.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Submit step 3 data
  const submitStep3 = async (id) => {
    try {
      setIsSaving(true)
      if (!validateCurrentStep()) {
        throw new Error("Please fill all required fields")
      }
      console.log('Step 3 validation failed. Errors:', errors);
      console.log("Submitting Step 3 data for patient ID:", id)
      const formDataToSubmit = prepareFormDataForAPI(3)
      // 🔍 Log all key-value pairs from the FormData
      console.log("FormData being submittedstep3:");
      for (let [key, value] of formDataToSubmit.entries()) {
        console.log(`${key}:`, value);
      }
      const response = await fetch(`https://webstrategy.co.in/rssdi/api/patient/step3/${id}`, {
        method: "POST",
        body: formDataToSubmit,
      })

      const data = await response.json()
      console.log("Step 3 API Response:", data)

      if (!response.ok) {
        const serverErrors = data.errors || {}
        const formattedErrors = {}
        Object.entries(serverErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages.join(", ") : messages
        })
        setErrors(formattedErrors)
        throw new Error(`Validation failed: ${data.message || "Please check all fields"}`)
      }

      toast.success("Step 3 data saved successfully!")
      return true
    } catch (error) {
      console.error("Error submitting step 3:", error)
      toast.error(error.message || "Failed to save step 3 data")
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Handle next step
  const nextStep = () => {
    const isValid = validateCurrentStep()
    if (!isValid) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`)
        if (errorElement) errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    setStep((prev) => Math.min(prev + 1, 3))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle previous step
  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const calculateFollowUpDate = (currentDate) => {
    const followUpDate = new Date(currentDate)
    followUpDate.setMonth(followUpDate.getMonth() + 6)
    return followUpDate
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isValid = validateAllSteps();
      if (!isValid) {
        toast.error("Please fill all required fields");
        return;
      }

      if (isSaving) return;
      setIsSaving(true);

      let patientIdToUse = patientId;

      // For new submissions, submit steps sequentially
      if (!isEditMode) {
        if (!patientIdToUse) {
          patientIdToUse = await submitStep1();
          setPatientId(patientIdToUse);
        }

        await submitStep2(patientIdToUse);
        await submitStep3(patientIdToUse);
      } else {
        // For edit mode, only submit changed sections
        if (Object.keys(editedFields.section1).length > 0) await submitStep1();
        if (Object.keys(editedFields.section2).length > 0) await submitStep2(patientIdToUse);
        if (Object.keys(editedFields.section3).length > 0) await submitStep3(patientIdToUse);
      }

      // Save to local storage and navigate
      const existingRecords = JSON.parse(localStorage.getItem("patientRecords") || "[]");
      const updatedRecord = {
        patientId: patientIdToUse,
        patient_name: formData.section1.patient_name,
        formData: formData,
        submissionDate: new Date().toISOString(),
        appointmentDate: new Date().toISOString(),
        status: "completed",
        lastVisit: new Date().toISOString(),
        followUpDate: calculateFollowUpDate(new Date()).toISOString(),
        canEdit: true,
      };

      // Update local storage
      const updatedRecords = isEditMode
        ? existingRecords.map(record => record.patientId === patientIdToUse ? updatedRecord : record)
        : [updatedRecord, ...existingRecords];
      localStorage.setItem("patientRecords", JSON.stringify(updatedRecords));

      // Clean up and navigate
      localStorage.removeItem("stepFormData");
      setEditedFields({ section1: {}, section2: {}, section3: {} });

      navigate("/user/rssdi-save-the-feet-2.0", {
        state: {
          showToast: true,
          toastMessage: isEditMode
            ? "Patient assessment updated successfully!"
            : "Patient assessment completed successfully!",
          refreshData: true,
        },
        replace: true,
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
    }))
    setUploadedFiles((prev) => [...prev, ...files])
  }

  // Handle file removal
  const handleRemoveFile = (index) => {
    const fileToRemove = uploadedFiles[index]
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle consent form download
  const handleDownloadForm = async () => {
    try {
      const pdfPath = "/Consent_form_registry.pdf"
      const link = document.createElement("a")
      link.href = pdfPath
      link.download = "Diabetes_Foot_Ulcer_Consent_Form.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      handleChange({ target: { name: "consentDownloaded", value: true } }, "section1")
    } catch (error) {
      console.error("Error downloading consent form:", error)
      toast.info("Failed to download consent form. Please contact support.")
    }
  }

  // Handle save for later
  const handleSaveForLater = async () => {
    setIsSaving(true)
    try {
      if (step === 1 && !patientId && Object.keys(editedFields.section1).length > 0) {
        const newPatientId = await submitStep1()
        setPatientId(newPatientId)
        setEditedFields((prev) => ({ ...prev, section1: {} }))
      } else if (step === 2 && patientId && Object.keys(editedFields.section2).length > 0) {
        await submitStep2(patientId)
        setEditedFields((prev) => ({ ...prev, section2: {} }))
      } else if (step === 3 && patientId && Object.keys(editedFields.section3).length > 0) {
        await submitStep3(patientId)
        setEditedFields((prev) => ({ ...prev, section3: {} }))
      }

      const formDataForStorage = JSON.parse(JSON.stringify(formData))
      if (formDataForStorage.section1.consentForm) {
        formDataForStorage.section1.consentForm = null
        formDataForStorage.section1.consentFormPreview = null
      }
      if (formDataForStorage.section2.necrosisPhoto) {
        formDataForStorage.section2.necrosisPhoto = null
        formDataForStorage.section2.necrosisPhotoPreview = null
      }
      if (formDataForStorage.section2.woundReferenceFile) {
        formDataForStorage.section2.woundReferenceFile = null
      }

      localStorage.setItem("stepFormData", JSON.stringify(formDataForStorage))
      toast.success("Progress saved successfully!")
      setShowUploadPopup(false)
      navigate("/user/rssdi-save-the-feet-2.0")
    } catch (error) {
      console.error("Error saving for later:", error)
      toast.error(error.message || "Failed to save progress. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle upload complete
  const handleUploadComplete = () => {
    localStorage.removeItem("stepFormData")
    setShowUploadPopup(false)
    navigate("/user/rssdi-save-the-feet-2.0")
  }
  console.log(
    'Backend image path:',
    `${IMAGE_BASE_URL}${formData.section2.woundReferenceFile}`
  );
  
  // Handle save
  const handleSave = async () => {
    if (validateCurrentStep()) {
      setIsSaving(true)
      try {
        if (step === 1 && !patientId && Object.keys(editedFields.section1).length > 0) {
          const newPatientId = await submitStep1()
          setPatientId(newPatientId)
          setEditedFields((prev) => ({ ...prev, section1: {} }))
        } else if (step === 2 && patientId && Object.keys(editedFields.section2).length > 0) {
          await submitStep2(patientId)
          setEditedFields((prev) => ({ ...prev, section2: {} }))
        } else if (step === 3 && patientId && Object.keys(editedFields.section3).length > 0) {
          await submitStep3(patientId)
          setEditedFields((prev) => ({ ...prev, section3: {} }))
        }

        const formDataForStorage = JSON.parse(JSON.stringify(formData))
        if (formDataForStorage.section1.consentForm) {
          formDataForStorage.section1.consentForm = null
          formDataForStorage.section1.consentFormPreview = null
        }
        if (formDataForStorage.section2.necrosisPhoto) {
          formDataForStorage.section2.necrosisPhoto = null
          formDataForStorage.section2.necrosisPhotoPreview = null
        }
        if (formDataForStorage.section2.woundReferenceFile) {
          formDataForStorage.section2.woundReferenceFile = null
        }

        localStorage.setItem("stepFormData", JSON.stringify(formDataForStorage))
        setShowSuccess({
          visible: true,
          type: "save",
          showSubmitOption: false,
          message: "Progress saved successfully!",
        })
        setTimeout(() => {
          setShowSuccess((prev) => ({ ...prev, visible: false }))
        }, 2000)
      } catch (error) {
        console.error("Error saving progress:", error)
        toast.error(error.message || "Failed to save progress. Please try again.")
      } finally {
        setIsSaving(false)
      }
    } else {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }

  // Handle save and continue
  // Update handleSaveAndContinue
  const handleSaveAndContinue = async () => {
    console.log(`handleSaveAndContinue called for step ${step}`);
    console.log('Current formData.section2:', formData.section2);
    console.log('Current editedFields.section2:', editedFields.section2);

    const isValid = validateCurrentStep();
    if (!isValid) {
      console.log('Validation failed. Errors:', errors);
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const errorElement =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`[id="${firstError}Upload"]`) ||
          document.querySelector(`.consent-verification`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        toast.error('Please fill all required fields');
      }
      return;
    }

    setIsSaving(true);
    try {
      let newPatientId = patientId;

      if (step === 1) {
        if (!newPatientId && Object.keys(editedFields.section1).length > 0) {
          newPatientId = await submitStep1();
          setPatientId(newPatientId);
          setEditedFields((prev) => ({ ...prev, section1: {} }));
        } else if (isEditMode && Object.keys(editedFields.section1).length > 0) {
          await submitStep1();
          setEditedFields((prev) => ({ ...prev, section1: {} }));
        }
      } else if (step === 2 && newPatientId && Object.keys(editedFields.section2).length > 0) {
        console.log(`Submitting Step 2 with patientId: ${newPatientId}`);
        await submitStep2(newPatientId);
        setEditedFields((prev) => ({ ...prev, section2: {} }));
      } else if (step === 3 && newPatientId && Object.keys(editedFields.section3).length > 0) {
        console.log(`Submitting Step 3 with patientId: ${newPatientId}`);
        await submitStep3(newPatientId);
        setEditedFields((prev) => ({ ...prev, section3: {} }));
      } else {
        console.log(`No changes to submit for step ${step} or missing patientId`);
      }

      const formDataForStorage = JSON.parse(JSON.stringify(formData));
      cleanUpFormData(formDataForStorage);
      localStorage.setItem('stepFormData', JSON.stringify(formDataForStorage));

      if (step < 3) {
        setStep((prev) => Math.min(prev + 1, 3));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Progress saved successfully!');
      }
    } catch (error) {
      console.error('Error saving and continuing:', error);
      toast.error(error.message || 'Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  // Clean up form data
  const cleanUpFormData = (data) => {
    if (data.section1.consentForm) {
      data.section1.consentForm = null
      data.section1.consentFormPreview = null
    }
    if (data.section2.necrosisPhoto) {
      data.section2.necrosisPhoto = null
      data.section2.necrosisPhotoPreview = null
    }
    if (data.section2.woundReferenceFile) {
      data.section2.woundReferenceFile = null
    }
  }

  // Handle add new
  const handleAddNew = () => {
    navigate("/user/rssdi-save-the-feet-2.0")
  }

  // Handle step click
  const handleStepClick = (stepNumber) => {
    if (stepNumber > step) {
      if (!validateCurrentStep()) {
        toast.error("Please complete the current step before moving forward.")
        return
      }
    }
    setStep(stepNumber)
  }

  // Render step
  const renderStep = () => {
    const stepProps = { formData, handleChange, errors, setErrors }
    switch (step) {
      case 1:
        return <StepForm1 {...stepProps} />
      case 2:
        return <StepForm2 {...stepProps} />
      case 3:
        return <StepForm3 {...stepProps} />
      default:
        return null
    }
  }

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
  }

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
                  aria-label={isEditMode ? "Update form" : "Submit form"}
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingOutlined style={{ marginRight: 8 }} />
                      <span>{isEditMode ? "Updating..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{isEditMode ? "Update Form" : "Submit Form"}</span>
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
            setShowSuccess({ ...showSuccess, visible: false })
            const event = { preventDefault: () => { } }
            handleSubmit(event)
          }}
          onEdit={() => {
            setShowSuccess({ ...showSuccess, visible: false })
            setIsEditMode(true)
            setStep(1)
          }}
          onReturnToDashboard={() => {
            setShowSuccess({ ...showSuccess, visible: false })
            navigate("/user/rssdi-save-the-feet-2.0", {
              state: {
                showToast: true,
                toastMessage: `Patient assessment ${isEditMode ? "updated" : "completed"}`,
              },
              replace: true,
            })
          }}
        />
      </div>
    </FormLayout>
  )
}

export default StepForm
