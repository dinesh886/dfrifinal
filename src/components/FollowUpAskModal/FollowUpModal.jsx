import React from "react";
import { Modal, Button } from "antd";

const FollowUpModal = ({ show, onClose, onChoice }) => {
    return (
        <Modal
            title="Schedule Follow-up"
            open={show}
            onCancel={onClose}
            centered
            footer={null}
        >
            <p>Please choose the follow-up period for this patient:</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                <Button type="primary" onClick={() => onChoice('3-month')}> {/* Changed to string */}
                    3 Months
                </Button>
                <Button type="primary" onClick={() => onChoice('6-month')}> {/* Changed to string */}
                    6 Months
                </Button>
            </div>
        </Modal>
    );
};

export default FollowUpModal;