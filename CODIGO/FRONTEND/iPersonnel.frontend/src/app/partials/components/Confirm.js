import React, { useState, useEffect } from "react";
import { Modal, Button } from 'react-bootstrap'
import $ from 'jquery';

const isFunctionDefined = functionName => functionName && typeof functionName === 'function';
const isNullOrUndefined = value => value === null || value === undefined;

const Confirm = ({
  isVisible,
  setIsVisible,
  setInstance,
  size,
  title,
  message,
  contentRender: userContentRender,
  onConfirm: onUserConfirm,
  onHide: onUserHide,
  className: dialogClassName,
  confirmText,
  cancelText,
  ...rest
}) => {
  const [deferred] = useState($.Deferred());

  const onConfirm = () => {
    onUserConfirm();
    deferred.resolve();
    setIsVisible(false);
  }

  const onHide = () => {
    deferred.resolve(true);
    setIsVisible(false);

    if (isFunctionDefined(onUserHide)) {
      onUserHide();
    }

  }

  const contentRender = () => {
    if (userContentRender) {
      return userContentRender({ instance: { deferred } });
    }
  }

  const IMG_ELIMINAR = "/media/iconsapp/eliminar.png";

  useEffect(() => {
    if (isFunctionDefined(setInstance)) setInstance({ deferred });
  }, []);

  useEffect(() => {
    if (!isVisible) deferred.resolve(true);
  }, [isVisible]);


  return (
    <Modal
      {...rest}
      dialogClassName="confirm-react-bootstrap"
      style={{ zIndex: 9050 }}
      show={isVisible}
      size={size || 'md'}
      onHide={onHide}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {title.toUpperCase() || ('Confirmation').toUpperCase()}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="login-navbar navbar navbar-expand-lg" style={{ height: '15px' }}>
          <div className="inner-container">
            <a href="#"> <img src={IMG_ELIMINAR} alt=""
              style={{ float: 'left', height: '55px', width: '80px', position: 'relative', width: '55px', marginTop: '-17px' }} />
            </a>
          </div>


          {/* <div className="swal2-container swal2-fade swal2-shown">
          <div className="swal2-icon swal2-question" style={{ display: 'block' }}>?</div>
        </div> */}
          <Modal.Title id="contained-modal-title-vcenter">
            <div style={{ marginLeft: '130px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>

              {!isNullOrUndefined(message) && <span >{message}</span>}
              {isNullOrUndefined(message) && isFunctionDefined(userContentRender) && contentRender()}

            </div>
          </Modal.Title>
        </div>

      </Modal.Body>

      <Modal.Footer style={{ marginTop: "15px" }}>
        <Button className="btn-confirm" onClick={onConfirm}>{confirmText || 'Confirm'}</Button>
        <Button className="btn-cancel" onClick={onHide} variant="light">{cancelText || 'Cancel'}</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Confirm;
