import React, { useState } from 'react';
import './StepForm.css'; 
import LeftFoot from '../../../assets/images/leftfoot.jpg'
import RightFoot from '../../../assets/images/rightfoot.jpg'

import { Upload } from 'lucide-react';
const StepForm3 = ({formData, handleChange, errors}) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const monofilamentPoints = ['A', 'B', 'C'];
  
    const [previewImage, setPreviewImage] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      if (file.size > 1024 * 1024) {
        setPreviewImage(null);
        setErrorMsg('Image must be smaller than 1MB');
        e.target.value = ''; // Clear input field
      } else {
        setErrorMsg('');
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

  return (
    <div className="medical-add-container">
      {/* <div className="medical-add-header">
        <h1>3-Minute Foot Examination</h1>
      </div> */}

      <form onSubmit={handleSubmit} className="medical-add-form">
        {/* Presence of Symptoms Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Presence of Symptoms</h2>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Do you have burning or tingling sensation in feet or leg?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="burningSensation"
                    value="yes"
                    checked={formData.section3.burningSensation === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="burningSensation"
                    value="no"
                    checked={formData.section3.burningSensation === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.burningSensation && <span className="error-message">{errors.burningSensation}</span>}
              </div>
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Does your leg or foot pain while walking?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="painWhileWalking"
                    value="yes"
                    checked={formData.section3.painWhileWalking === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="painWhileWalking"
                    value="no"
                    checked={formData.section3.painWhileWalking === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.painWhileWalking && <span className="error-message">{errors.painWhileWalking}</span>}
              </div>
            </div>
          </div>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Are there changes in skin color or skin lesions?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="skinChanges"
                    value="yes"
                    checked={formData.section3.skinChanges === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="skinChanges"
                    value="no"
                    checked={formData.section3.skinChanges === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.skinChanges && <span className="error-message">{errors.skinChanges}</span>}
              </div>
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Is there any loss of lower extremity sensation in the leg/foot?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="sensationLoss"
                    value="yes"
                    checked={formData.section3.sensationLoss === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="sensationLoss"
                    value="no"
                    checked={formData.section3.sensationLoss === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.sensationLoss && <span className="error-message">{errors.sensationLoss}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Dermatologic Exam Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Dermatologic Exam</h2>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Does the patient have discolored, ingrown, or elongated nails?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="nailProblems"
                    value="yes"
                    checked={formData.section3.nailProblems === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="nailProblems"
                    value="no"
                    checked={formData.section3.nailProblems === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.nailProblems && <span className="error-message">{errors.nailProblems}</span>}
              </div>
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Are there signs of fungal infection especially in between the toes?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="fungalInfection"
                    value="yes"
                    checked={formData.section3.fungalInfection === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="fungalInfection"
                    value="no"
                    checked={formData.section3.fungalInfection === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.fungalInfection && <span className="error-message">{errors.fungalInfection}</span>}
              </div>
            </div>
          </div>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Does the patient have discolored and/or hypertrophic skin lesions, calluses, or corns?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="skinLesions"
                    value="yes"
                    checked={formData.section3.skinLesions === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="skinLesions"
                    value="no"
                    checked={formData.section3.skinLesions === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.skinLesions && <span className="error-message">{errors.skinLesions}</span>}
              </div>
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Does the patient have open wound or heel fissure?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="openWound"
                    value="yes"
                    checked={formData.section3.openWound === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="openWound"
                    value="no"
                    checked={formData.section3.openWound === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.openWound && <span className="error-message">{errors.openWound}</span>}
              </div>
            </div>
          </div>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='required'>Is there any warmth/swelling/redness in the foot which is suggestive of cellulitis?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="cellulitis"
                    value="yes"
                    checked={formData.section3.cellulitis === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="cellulitis"
                    value="no"
                    checked={formData.section3.cellulitis === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.cellulitis && <span className="error-message">{errors.cellulitis}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Neurologic Exam Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Neurologic Exam (10g Monofilament Test)</h2>
          <label className="subtitle required">Is the patient responsive to 10g monofilament?</label>

          {/* First Row */}
          <div className="medical-add-row align-items-center medical-add-row">
            <div className="col-md-6">
              <div className="foot-image-container text-center">
                <img
                  src={LeftFoot}
                  alt="Foot monofilament test points 1"
                  className="img-fluid foot-diagram"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="monofilament-test-options">
                {monofilamentPoints.map((point) => (
                  <div className="monofilament-point" key={`left-${point}`}>
                    <span className="point-label">{point}</span>
                    <div className="medical-add-radio-group">
                      <label className='medical-add-radio-label'>
                        <input
                          type="radio"
                          name={`monofilamentLeft${point}`}
                          value="yes"
                          checked={formData.section3[`monofilamentLeft${point}`] === 'yes'}
                         onChange={(e) => handleChange(e, 'section3')}
                          className="medical-add-radio-button"
                          required
                        />
                        <span className="medical-add-radio-button-label">Yes</span>
                      </label>
                      <label className='medical-add-radio-label'>
                        <input
                          type="radio"
                          name={`monofilamentLeft${point}`}
                          value="no"
                          checked={formData.section3[`monofilamentLeft${point}`] === 'no'}
                         onChange={(e) => handleChange(e, 'section3')}
                          className="medical-add-radio-button"
                          required
                        />
                        <span className="medical-add-radio-button-label">No</span>
                      </label>
                      {errors[`monofilamentLeft${point}`] && <span className="error-message">{errors[`monofilamentLeft${point}`]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="row align-items-center medical-add-row">
            <div className="col-md-6">
              <div className="foot-image-container text-center">
                <img
                  src={RightFoot}
                  alt="Foot monofilament test points 2"
                  className="img-fluid foot-diagram"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="monofilament-test-options">
                {monofilamentPoints.map((point) => (
                  <div className="monofilament-point" key={`right-${point}`}>
                    <span className="point-label ">{point}</span>
                    <div className="medical-add-radio-group">
                      <label className='medical-add-radio-label'>
                        <input
                          type="radio"
                          name={`monofilamentRight${point}`}
                          value="yes"
                          checked={formData.section3[`monofilamentRight${point}`] === 'yes'}
                         onChange={(e) => handleChange(e, 'section3')}
                          className="medical-add-radio-button"
                          required
                        />
                        <span className="medical-add-radio-button-label">Yes</span>
                      </label>
                      <label className='medical-add-radio-label'>
                        <input
                          type="radio"
                          name={`monofilamentRight${point}`}
                          value="no"
                          checked={formData.section3[`monofilamentRight${point}`] === 'no'}
                         onChange={(e) => handleChange(e, 'section3')}
                          className="medical-add-radio-button"
                          required
                        />
                        <span className="medical-add-radio-button-label">No</span>
                      </label>
                      {errors[`monofilamentRight${point}`] && (<span className="error-message">{errors[`monofilamentRight${point}`]}</span>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Musculoskeletal Exam Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Musculoskeletal Exam</h2>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Does the patient have obvious deformities in the feet?</label>
              <div className="medical-add-radio-group">
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="footDeformities"
                    value="yes"
                    checked={formData.section3.footDeformities === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className='medical-add-radio-label'>
                  <input
                    type="radio"
                    name="footDeformities"
                    value="no"
                    checked={formData.section3.footDeformities === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.footDeformities && <span className="error-message">{errors.footDeformities}</span>}
              </div>
            </div>

            {formData.section3.footDeformities === 'yes' && (
              <div className="medical-add-group">
                <label className='required medical-add-radio-label'>If yes, for how long?</label>
                <input
                  type="text"
                  name="deformityDuration"
                  value={formData.section3.deformityDuration}
                 onChange={(e) => handleChange(e, 'section3')}
                  placeholder="Duration"
                  className="medical-add-input"
                  required
                />
                  {errors.deformityDuration && <span className="error-message">{errors.deformityDuration}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Vascular Exam Section */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Vascular Exam</h2>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Is the hair growth on the foot dorsum or lower limb decreased?</label>
              <div className="medical-add-radio-group">
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="hairGrowth"
                    value="yes"
                    checked={formData.section3.hairGrowth === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="hairGrowth"
                    value="no"
                    checked={formData.section3.hairGrowth === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.hairGrowth && <span className="error-message">{errors.hairGrowth}</span>}
              </div>
            </div>

            <div className="medical-add-group">
              <label className='medical-add-label required'>Are the dorsalis pedis and posterior tibial pulses palpable?</label>
              <div className="medical-add-radio-group">
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="pulsesPalpable"
                    value="yes"
                    checked={formData.section3.pulsesPalpable === 'yes'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Yes</span>
                </label>
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="pulsesPalpable"
                    value="no"
                    checked={formData.section3.pulsesPalpable === 'no'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">No</span>
                </label>
                {errors.pulsesPalpable && <span className="error-message">{errors.pulsesPalpable}</span>}
              </div>

            </div>
          </div>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <label className='medical-add-label required'>Is the temperature of the skin cold/warm/normal?</label>
              <div className="medical-add-radio-group">
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="skinTemperature"
                    value="cold"
                    checked={formData.section3.skinTemperature === 'cold'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Cold</span>
                </label>
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="skinTemperature"
                    value="warm"
                    checked={formData.section3.skinTemperature === 'warm'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Warm</span>
                </label>
                <label className="medical-add-radio-label">
                  <input
                    type="radio"
                    name="skinTemperature"
                    value="normal"
                    checked={formData.section3.skinTemperature === 'normal'}
                   onChange={(e) => handleChange(e, 'section3')}
                    className="medical-add-radio-button"
                    required
                  />
                  <span className="medical-add-radio-button-label">Normal</span>
                </label>
                {errors.skinTemperature && <span className="error-message">{errors.skinTemperature}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Foot Image Upload */}
        <div className="medical-add-section">
          <h2 className="medical-add-section-title">Patient's Foot Image (Optional)</h2>

          <div className="medical-add-row">
            <div className="medical-add-group">
              <div className="medical-image-preview-card">
                {/* Image Preview and Remove Button - shown only when image exists */}
                {previewImage ? (
                  <div className="medical-image-preview-wrapper">
                    <img
                      src={previewImage}
                      alt="Foot preview"
                      className="medical-image-preview"
                    />
                    <div className="medical-image-actions">
                      <button
                        type="button"
                        className="medical-image-remove-btn"
                        onClick={() => {
                          setPreviewImage(null);
                          handleChange({
                            target: { name: 'footImage', value: null },
                          }, 'section2');
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Area - shown only when no image exists */
                  <label className="medical-upload-card">
                    <input
                      type="file"
                      name="footImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="medical-upload-input"
                    />
                    <div className="medical-upload-content">
                      <div className="medical-upload-icon-wrapper">
                        <svg className="medical-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="medical-upload-text">
                        <p className="medical-upload-title">Click to Upload foot image</p>
                        <p className="medical-upload-subtitle">JPG, PNG (Max 5MB)</p>
                      </div>
                    </div>
                  </label>
                )}

                {/* Error Message */}
                {errorMsg && (
                  <div className="medical-add-image-upload-error">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" />
                    </svg>
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StepForm3;