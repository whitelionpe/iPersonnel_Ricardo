import React, { useState, useEffect, useContext } from 'react';
import { ReportServerContext } from './ReportServerContext';

const DocumentSelector = ({ documentSelected }) => {
    const [data, setData] = useState(null);
    const { tokenInfo, serviceBaseUrl } = useContext(ReportServerContext);

    useEffect(() => {
        console.log("tokenInfo", tokenInfo);
        if (!tokenInfo) return;
        console.log("serviceBaseUrl", serviceBaseUrl);
        fetch(serviceBaseUrl + '/api/documents', { headers: tokenInfo.authHeaders })
            .then(res => res.json())
            .then(docs =>
                docs.map(d => ({
                    id: d.id,
                    displayName: `${d.documentType}: ${d.name}`,
                    documentType: d.documentType
                }))
            )
            .then(docs =>{
                console.log("then.docs",docs);               
                docs.sort((d1, d2) => d1.displayName.localeCompare(d2.displayName));
                setData(docs);
            })
            .then(docs => {
                console.log("them.data",docs);
                //setData(docs)
             } );
    }, [tokenInfo, serviceBaseUrl]);

    const dummyEntry = data
        ? data.length
            ? '--- Select a Document ---'
            : 'No documents found'
        : '--- Loading Document List ---';

    return (
        <div style={{ height: '40px' }}>
            <select
                onChange={e =>
                    documentSelected(data.find(d => d.id === parseInt(e.target.value)))
                }
            >
                <option value={-1}>{dummyEntry}</option>
                {data &&
                    data.map((doc, index) => (
                        <option key={index} value={doc.id}>
                            {doc.displayName}
                        </option>
                    ))}
            </select>
        </div>
    );
};

export default DocumentSelector;
