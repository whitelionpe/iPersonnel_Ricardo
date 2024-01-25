import React from "react";
import { injectIntl } from "react-intl";

const Summary = props => {
  const { intl } = props;

  const summaryStyle = { textAlign: 'center', position: 'absolute', paddingTop: '8px', paddingLeft: '8px' };

  return (
    <>
         <div>
                <span className="dx-datagrid-summary-item dx-datagrid-text-content classColorPaginador_" style={summaryStyle}> { intl.formatMessage({ id: "COMMON.TOTAL.ROW" }) +" "+ props.TotalItem } </span> 
         </div>
    </>
  );
};

export default injectIntl(Summary);
