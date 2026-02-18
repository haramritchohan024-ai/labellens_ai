import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactModal from 'react-modal';

// Set simple modal style
const modalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '16px',
        padding: '24px',
        border: 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '90vw',
        width: '400px'
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50
    }
};

const AdditiveCard = ({ additive }) => {
    const [modalIsOpen, setIsOpen] = useState(false);

    const getRiskBadge = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold border border-red-200">High Risk</span>;
            case 'medium': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200">Medium Risk</span>;
            case 'low': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">Low Risk</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">Unknown</span>;
        }
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full"
            >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">{additive.name}</h4>
                        <p className="text-xs font-mono text-gray-500 bg-gray-100 inline-block px-1.5 rounded mt-0.5">
                            {additive.code}
                        </p>
                    </div>
                    {getRiskBadge(additive.riskLevel)}
                </div>

                <div className="flex-grow">
                    <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold text-gray-800">Use:</span> {additive.category}
                    </p>
                    <p className="text-sm text-gray-500 leading-snug mb-3 line-clamp-2">
                        {additive.description || additive.notes || "No description available."}
                    </p>

                    {/* Sensitivity Tags */}
                    {additive.sensitivityTags && additive.sensitivityTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {additive.sensitivityTags.map((tag, i) => (
                                <span key={i} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100 flex items-center">
                                    <AlertTriangle size={8} className="mr-1" /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    className="mt-4 text-xs font-bold text-blue-600 flex items-center hover:underline"
                >
                    <Info size={14} className="mr-1" /> View Regulatory Status & Details
                </button>
            </motion.div>

            {/* Details Modal */}
            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={() => setIsOpen(false)}
                style={modalStyles}
                ariaHideApp={false}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{additive.name} ({additive.code})</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 font-bold uppercase mb-1">Regulatory Status (BIS/FSSAI)</p>
                        <p className="text-gray-800 font-medium">
                            {additive.regulatoryStatus || "Permitted for use in certain food categories."}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase mb-1">Full Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {additive.description || additive.notes || "No additional description available."}
                        </p>
                    </div>

                    {additive.groupWarnings && Object.keys(additive.groupWarnings).length > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <p className="text-sm text-red-700 font-bold mb-2">Warnings</p>
                            <ul className="text-sm text-red-700 space-y-1">
                                {Object.entries(additive.groupWarnings).map(([key, msg]) => (
                                    <li key={key}>• {msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </ReactModal>
        </>
    );
};

export default AdditiveCard;
