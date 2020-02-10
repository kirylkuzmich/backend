using { period, ExternalIDT } from './Common';

namespace abstractPlanning;




abstract entity Projects : period  {
	description	       : String(200);

	jiraLink           : String(100);
	probability        : Integer;
}

abstract entity Employees {

    phone              : String(15);
    jiraLink           : String(100);
    dateEnd            : Date;
    imageUri           : String(200);
    isActive           : Boolean;

}

abstract entity ProjectAssignments : period {
	involvePercent : Integer default 100;
}

abstract entity Positions {
	rank : Integer enum { manager = 1; administrator; senior; middle; junior; tester; consult };
}
