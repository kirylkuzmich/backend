using planningEntities as db from '../db/PlanningDataModel';

service PlanningService {
  	entity Positions          @readonly @(title : '{i18n>positionsViewTitle}')          as projection on db.Positions;
    entity Employees          @readonly @(title : '{i18n>reportedHoursViewTitle}')      as projection on db.Employees;
    entity Projects           @readonly @(title : '{i18n>projectsViewTitle}')           as projection on db.Projects;
    entity ProjectAssignments @readonly @(title : '{i18n>employeesViewTitle}')          as projection on db.ProjectAssignments;
    entity ReportedHours      @readonly @(title : '{i18n>projectAssignmentsViewTitle}') as projection on db.ReportedHours;
}
