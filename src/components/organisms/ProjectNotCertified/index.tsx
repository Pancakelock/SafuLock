import React from 'react';

import Arrow from '../../../assets/img/arrow-right.svg';
import Close from '../../../assets/img/close.svg';
import { IModalProps } from '../../../types';
import { Button } from '../../atoms';

import './ProjectNotCertified.scss';

const ProjectNotCertified: React.FC<IModalProps> = ({ handleChangeOpen }) => {
  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  return (
    <>
      <div className="projectNotCertified_overlay" onClick={onCloseModal} role="presentation" />
      <div className="projectNotCertified">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="projectNotCertified_title box-c-c">
          <span className="h1 text-yellow text-bold text-center">
            Your project is not certified
          </span>
          <span className="h2 text-white text-bold text-center">
            Your project is not certified, to allow to use the platform, we will check project and
            contact you by e-mail within 24 hours
          </span>
        </div>
        <div className="projectNotCertified_body">
          <Button
            type="submit"
            size="primary"
            colorScheme="yellow"
            icon={Arrow}
            link="/"
            className="projectNotCertified_btn"
            onClick={() => handleChangeOpen(false)}
          >
            Back to the Home Page
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProjectNotCertified;
