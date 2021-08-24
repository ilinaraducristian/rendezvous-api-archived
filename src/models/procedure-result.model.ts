import { ResultSetHeader } from 'mysql2';

type ProcedureResult = [...any, ResultSetHeader];

export default ProcedureResult;