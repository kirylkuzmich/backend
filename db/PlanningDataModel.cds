using abstractPlanning from './AbstractPlanning';
using abstractJiraCache from './AbstractJiraCache';
using { cuid } from '@sap/cds/common';

namespace planningEntities;




entity Positions : cuid, abstractPlanning.Positions {}

entity Employees : cuid, abstractPlanning.Employees, abstractJiraCache.Employees {
	projectAssignments : Association to many ProjectAssignments on projectAssignments.employee = $self;

	position           : Association to Positions;
}

entity Projects : cuid, abstractPlanning.Projects, abstractJiraCache.Projects {
	projectAssignments : Association to many ProjectAssignments on projectAssignments.project = $self;
}

entity ProjectAssignments : cuid, abstractJiraCache.ProjectAssignments, abstractPlanning.ProjectAssignments {
	project        : Association to Projects;
	employee       : Association to Employees;
	position       : Association to Positions;
	hours          : Association to many ReportedHours on hours.projectAssignments = $self;
}

entity ReportedHours : cuid, abstractJiraCache.ReportedHours {
	projectAssignments : Association to ProjectAssignments;
};
