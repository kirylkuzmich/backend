using { ExternalIDT } from './Common';

namespace abstractJiraCache;




abstract entity Employees {
	externalID   : ExternalIDT;
	name         : String(50);
	emailAddress : String(80);
}

abstract entity ProjectAssignments {
	projectID     : ExternalIDT;
	employeeID    : ExternalIDT;
}

abstract entity ReportedHours {
	date              : Date;
	hours             : Integer;
}

abstract entity Projects {
	externalID   : ExternalIDT;
	name         : String(50);
	projectType  : String(20);
	departmentID : ExternalIDT;
}
