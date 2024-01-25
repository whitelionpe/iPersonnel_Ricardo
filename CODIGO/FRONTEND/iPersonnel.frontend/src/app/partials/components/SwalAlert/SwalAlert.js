import React, { useEffect } from "react";
import Swal from 'sweetalert2'
import './style.css';
const SwalAlert = ({
  title,
  message,
  type,
}) => {
  const Toast = Swal.mixin({
    timer: 1,
    showConfirmButton: false,
    customClass: {
      popup: 'swal-alert-popup-class',
    },
  });

  const getTarget = () => document.body.querySelector('div.hidden') ? document.body.querySelector('div.hidden') : document.createElement('div');

  const render = () => {
    const target = getTarget();
    if (!document.body.querySelector('div.hidden')) {
      target.classList.add('hidden');
      document.body.appendChild(target);
    }
    Toast.fire({ titleText: title, text: message, icon: type, target });
    return (
      <div dangerouslySetInnerHTML={{ __html: Toast.getPopup().outerHTML }} />
    );
  }

  useEffect(() => {
    return () => {
      getTarget().remove();
    }
  }, []);

  return (
    <>
      { render() }
    </>
  );
};

export default SwalAlert;
export { SwalAlert };
