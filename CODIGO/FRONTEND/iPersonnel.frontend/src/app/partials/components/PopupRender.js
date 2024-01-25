import React from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";

const PopupRender = props => {
  const { intl, renderDataGrid , title} = props;

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"600px"}
        title={(intl.formatMessage({ id: "ACTION.VIEW" }) + ' ' + title ).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
       
        {renderDataGrid()}

      </Popup>
    </>
  );
};

PopupRender.propTypes = {
  title: PropTypes.string
};
PopupRender.defaultProps = {
  title: ""
};
export default injectIntl(PopupRender);
