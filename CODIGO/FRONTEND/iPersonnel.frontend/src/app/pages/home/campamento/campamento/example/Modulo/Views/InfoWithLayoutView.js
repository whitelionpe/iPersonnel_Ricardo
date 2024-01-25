import React from "react";
import { Button } from "devextreme-react";
import LayoutView from "../../../../../../../partials/components/LayoutView";

const InfoWithLayoutView = ({
  item,
  targetChanges,
  mergeData,
  changeView,
  applyChanges,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const { Modulo, IdModulo, Disabled, Etiqueta } = mergeData || {};
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const changeItem = () => applyChanges(item, { forSelected: { Disabled: false, Etiqueta: 'SELECTED' }, forUnselected: { Disabled: true, Etiqueta: 'UNSELECTED' } });
  const renderHeader = () => {
    return (
      <h2>Soy Header en LayoutView</h2>
    );
  }
  const renderLeft = () => {
    return (
      <>
        {
          <div>
            <Button icon="edit" onClick={changeView} />
            <Button icon="codeblock" onClick={changeItem} />
            <h2>{Modulo}</h2>
            <h5>{IdModulo}</h5>
            <h6>{Disabled ? 'DISABLED' : 'ENABLED'}</h6>
            <h6>{Etiqueta}</h6>
          </div>
        }
      </>
    );
  }
  const renderCenter = () => {
    return (
      <>
        {
          <div>
            <Button icon="edit" onClick={changeView} />
            <Button icon="codeblock" onClick={changeItem} />
            <h2>{Modulo}</h2>
            <h5>{IdModulo}</h5>
            <h6>{Disabled ? 'DISABLED' : 'ENABLED'}</h6>
            <h6>{Etiqueta}</h6>
          </div>
        }
      </>
    );
  }
  const renderRight = () => {
    return (
      <>
        {
          <div>
            <Button icon="edit" onClick={changeView} />
            <Button icon="codeblock" onClick={changeItem} />
            <h2>{Modulo}</h2>
            <h5>{IdModulo}</h5>
            <h6>{Disabled ? 'DISABLED' : 'ENABLED'}</h6>
            <h6>{Etiqueta}</h6>
          </div>
        }
      </>
    );
  }
  const renderFooter = () => {
    return (
      <h5>Soy Footer en LayoutView</h5>
    );
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <LayoutView
      renderHeader={renderHeader}
      renderLeft={renderLeft}
      renderCenter={renderCenter}
      renderRight={renderRight}
      renderFooter={renderFooter}
    />
  );
  // --------------------------------------------------------------------
};

export default InfoWithLayoutView;