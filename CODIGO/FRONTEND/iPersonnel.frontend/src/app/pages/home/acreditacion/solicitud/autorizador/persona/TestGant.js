import React from 'react';
import Gantt, { Tasks, Dependencies, Resources, ResourceAssignments, Column, Editing } from 'devextreme-react/gantt';
import { tasks, dependencies, resources, resourceAssignments } from './data.js';
// import TaskTemplate  from './TaskTemplate.js';
import "./styles.css";

//import "../../../../../../../../public/assets/dx/css/dx.light.css";
// import '../../../../../../../../node_modules/devexpress-gantt/dist/dx-gantt.css';
// import '../../../../../../../../node_modules/devexpress-gantt/dist/dx-gantt.js';
//  import '../../../../../../../../node_modules/devexpress-gantt/dist/dx-gantt';
// import '@devextreme/dist/css/dx.light.css';
// import '@devexpress-gantt/dist/dx-gantt.css'; 

const renderContent = (item) => {
  return ( 
    <div className="custom-task" style={{width: item.taskSize.width + "px"}}> 
        {/* <div className="custom-task-title">{item.taskData.title}</div>  */}
        <h1>test </h1>
    </div> 
);     
} 

const TestGant = (props) => {
  return (
    <div id="form-demo">
    <div className="widget-container">
      <Gantt
        taskListWidth={500}
        height={700}
        scaleType="days"
        taskContentRender={renderContent}
     >

      <Tasks dataSource={tasks} />
      <Dependencies dataSource={dependencies} />
      <Resources dataSource={resources} />
      <ResourceAssignments dataSource={resourceAssignments} />

        <Column dataField="title" caption="Subject" width={300} />
        <Column dataField="start" caption="Start Date" />
        <Column dataField="end" caption="End Date" />

        <Editing enabled={false} />
      </Gantt>
    </div>
  </div>
  );
  
}

export default TestGant;
