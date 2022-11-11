const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || '192.168.3.206',
  database: process.env.PG_DATABASE || 'time_log',
  password: process.env.PG_PASSWORD || '',
  port: process.env.PG_PORT || 54131,
})

const getSystems = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT system_id, system_name FROM timebot.systems ORDER BY system_name", (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.rows);

      });
  });
};

const getProjects = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT project_id, project_name, allowed_systems FROM timebot.projects ORDER BY project_name", (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.rows);

      });
  });
};

const getActions = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT action_id, action_name FROM timebot.actions ORDER BY action_name", (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.rows);

      });
  });
};

const getEmployees = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT employee_id, employee_name, slack_id FROM timebot.employees WHERE date_deleted IS NULL ORDER BY employee_name", (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.rows);

      });
  });
};

const getEmployeeBySlackId = (slackId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT employee_id, employee_name, slack_id FROM timebot.employees WHERE slack_id = $1 AND date_deleted IS NULL", [slackId], (error, results) => {
        if (error) {
          console.log(error);
          reject(error);
          return;
        }
        if (results.rows.length === 1) {
          resolve(results.rows[0]);
        }
        else {
          resolve(null);
        }
      });
  });
};

const getEmployeeById = (employeeId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT employee_id, employee_name, slack_id FROM timebot.employees WHERE employee_id = $1 AND date_deleted IS NULL", [
      employeeId
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.rows.length === 1) {
        resolve(results.rows[0]);
      }
      else {
        resolve(null);
      }

    });
  });
};
//'2022-10-28', 1
const getTasksForDateByUserSlackId = (date, slackId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "WITH employee as ( " +
      "SELECT employee_id FROM timebot.employees WHERE slack_id = $1 " +
      ") " +
      "SELECT task_id, et.employee_id, system_id, project_id, action_id, hours, description, date_created FROM employee e, timebot.employee_tasks et WHERE et.employee_id = e.employee_id AND date_created > $2", [
      slackId, date
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      console.log(results);
      resolve(results.rows);
    });
  });
};




module.exports = {
  getEmployees,
  getEmployeeBySlackId,
  getEmployeeById,
  getTasksForDateByUserSlackId,
  getSystems,
  getProjects,
  getActions
}