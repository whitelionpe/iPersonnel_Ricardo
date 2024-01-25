import React from "react";
import SwalAlert from '../SwalAlert';

export const InfoMessageViewItem = ({ title = '', message = '' } = {}) => (<SwalAlert { ...{ title, message, type: 'info' } }/>);
export const SuccessMessageViewItem = ({ title = '', message = '' } = {}) => (<SwalAlert { ...{ title, message, type: 'success' } }/>);
export const WarningMessageViewItem = ({ title = '', message = '' } = {}) => (<SwalAlert { ...{ title, message, type: 'warning' } }/>);
export const ErrorMessageViewItem = ({ title = '', message = '' } = {}) => (<SwalAlert { ...{ title, message, type: 'error' } }/>);
export const QuestionMessageViewItem = ({ title = '', message = '' } = {}) => (<SwalAlert { ...{ title, message, type: 'question' } }/>);
