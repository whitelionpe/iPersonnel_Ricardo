import React, { useRef, useState } from "react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../content/Portlet";
import HeaderInformation from "../HeaderInformation";
import { ButtonBar } from "../ButtonBar";

const DynamicReportHeader = ({
  id,
  intl,
  children,
  eventSearch,
  eventRefresh = () => {},
  eventExport = () => {}
}) => {
  const divFilterRef = useRef(null);
  const [viewFilter, setViewFilter] = useState(true);
  const hideFilter = e => {
    e.event.preventDefault();
    e.event.stopPropagation();
    if (viewFilter) {
      divFilterRef.current.classList.add("hidden");
    } else {
      divFilterRef.current.classList.remove("hidden");
    }
    setViewFilter(!viewFilter);
  };
  return (
    <>
      <HeaderInformation
        data={() => {}}
        visible={true}
        labelLocation={"left"}
        colCount={1}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <ButtonBar
                  id={`a${id}_efip`}
                  intl={intl}
                  showExportButton={true}
                  viewFilter={viewFilter}
                  OnClickHidenFilter={hideFilter}
                  OnClickFilter={eventSearch}
                  OnClickRefresh={eventRefresh}
                  OnClickExport={eventExport}
                  validationGroup="FormEdicion"
                />
              </PortletHeaderToolbar>
            }
          />
        }
      />

      <PortletBody>
        <div className="row">
          <div className="col-12" ref={divFilterRef}>
            {children}
          </div>
        </div>
      </PortletBody>
    </>
  );
};

export default DynamicReportHeader;
