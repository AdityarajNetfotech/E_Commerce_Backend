import express from 'express';
import { Schoolregister,SchoolLogin,SchoolLogout,getAllSchools,deleteSchool,updateSchoolDetails} from '../controllers/SchoolAuth.js';

const SchoolRoutes = express.Router();

SchoolRoutes.post('/Schoolregister', Schoolregister);
SchoolRoutes.post('/Login', SchoolLogin);
SchoolRoutes.post('/Logout', SchoolLogout);
SchoolRoutes.get('/getAllSchools', getAllSchools);
SchoolRoutes.delete('/:schoolId',deleteSchool);
SchoolRoutes.put('/update-school/:schoolId', updateSchoolDetails);
export default SchoolRoutes;