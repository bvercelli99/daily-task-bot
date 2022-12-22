const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || '192.168.3.206',
  database: process.env.PG_DATABASE || 'time_log',
  password: process.env.PG_PASSWORD || '',
  port: process.env.PG_PORT || 54131,
});
const ptoPool = new Pool({
  user: process.env.PTO_PG_USER || 'postgres',
  host: process.env.PTO_PG_HOST || '192.168.3.206',
  database: process.env.PTO_PG_DATABASE || 'pto',
  password: process.env.PTO_PG_PASSWORD || '',
  port: process.env.PTO_PG_PORT || 54131,
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

const getEmployeesForNotifications = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT employee_id, employee_name, slack_id FROM timebot.employees WHERE date_deleted IS NULL AND notifications = true ORDER BY employee_name", (error, results) => {
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
      "SELECT task_id, et.employee_id, system_id, project_id, action_id, hours, description, date_created, unplanned " +
      "FROM employee e, timebot.employee_tasks et " +
      "WHERE et.employee_id = e.employee_id AND date_created = $2 AND et.date_deleted IS NULL " +
      "ORDER BY task_id ", [
      slackId, date
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};

const getTaskByTaskId = (slackId, taskId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "WITH employee as ( " +
      "SELECT employee_id FROM timebot.employees WHERE slack_id = $1 " +
      ") " +
      "SELECT task_id, et.employee_id, system_id, project_id, action_id, hours, description, date_created, unplanned " +
      "FROM employee e, timebot.employee_tasks et " +
      "WHERE et.employee_id = e.employee_id AND task_id = $2 AND et.date_deleted IS NULL ", [
      slackId, taskId
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows[0]);
    });
  });
};

const addTaskForSlackUser = (slackId, systemId, projectId, actionId, hours, description, date, unplanned) => {

  return new Promise((resolve, reject) => {
    pool.query(
      "WITH employee as ( " +
      "SELECT employee_id FROM timebot.employees WHERE slack_id = $1 " +
      ") " +
      "INSERT INTO timebot.employee_tasks(" +
      "employee_id, system_id, project_id, action_id, hours, description, date_created, unplanned) " +
      "VALUES ((SELECT employee_id FROM employee), $2, $3, $4, $5, $6, $7, $8) RETURNING task_id;", [
      slackId,
      systemId,
      projectId,
      actionId,
      hours,
      description,
      date,
      unplanned
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows[0].task_id);
    });
  });
};

const editTaskForSlackUser = (slackId, taskId, systemId, projectId, actionId, hours, description, unplanned) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "WITH employee as ( " +
      "SELECT employee_id FROM timebot.employees WHERE slack_id = $1 " +
      ") " +
      "UPDATE timebot.employee_tasks " +
      "SET system_id = $3, project_id = $4, action_id = $5, hours = $6, description = $7, unplanned = $8 " +
      "WHERE employee_id = (SELECT employee_id FROM employee) AND task_id = $2 " +
      "RETURNING task_id;", [
      slackId,
      taskId,
      systemId,
      projectId,
      actionId,
      hours,
      description,
      unplanned
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows[0].task_id);
    });
  });
};

const deleteTaskForSlackUser = (slackId, taskId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "WITH employee as ( " +
      "SELECT employee_id FROM timebot.employees WHERE slack_id = $1 " +
      ") " +
      "UPDATE timebot.employee_tasks SET date_deleted = now() " +
      "WHERE employee_id = (SELECT employee_id FROM employee) AND task_id = $2;", [
      slackId,
      taskId
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows[0]);
    });
  });
};

const getTotalHoursForEmployeeByDate = (slackId, date) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "WITH employee as ( " +
      "SELECT employee_id FROM timebot.employees WHERE slack_id = $1 " +
      ") " +
      "SELECT sum(hours) " +
      "FROM employee e, timebot.employee_tasks et " +
      "WHERE et.employee_id = e.employee_id AND date_created = $2 AND et.date_deleted IS NULL ;", [
      slackId,
      date
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows[0].sum);
    });
  });
};

const getIsUserOnPto = (slackId, formattedDate) => {
  return new Promise((resolve, reject) => {
    ptoPool.query("WITH employee as ( " +
      "SELECT employee_id FROM pto.employees WHERE slack_id = $1" +
      "), " +
      "requests as ( " +
      "SELECT request_id FROM pto.requests " +
      "WHERE requested_by = (SELECT employee_id FROM employee) " +
      "AND date_requested >= now()::date - INTERVAL '1 month' AND  date_requested <= now()::date + INTERVAL '1 month' " +
      "AND status = 'approved' " +
      ") " +
      "SELECT true FROM pto.request_days rd " +
      "WHERE rd.date = $2 AND request_id IN (SELECT request_id FROM requests) ", [
      slackId,
      formattedDate
    ], (error, results) => {
      if (error) {
        reject(error);
      }
      if (results) {
        if (results.rows[0]) {
          resolve(true);
        }
      }
      resolve(false);
    });
  });
};

const getRandomQuip = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT quip_text FROM timebot.quips OFFSET random() * (SELECT count(*) - 1 FROM timebot.quips) LIMIT 1 ", (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.rows[0].quip_text);
      });
  });
};


//SELECT quip_text FROM timebot.quips OFFSET random() * (SELECT count(*) FROM timebot.quips) LIMIT 1 ;

module.exports = {
  getEmployeesForNotifications,
  getEmployeeBySlackId,
  getEmployeeById,
  getTasksForDateByUserSlackId,
  getSystems,
  getProjects,
  getActions,
  addTaskForSlackUser,
  editTaskForSlackUser,
  deleteTaskForSlackUser,
  getTaskByTaskId,
  getTotalHoursForEmployeeByDate,
  getIsUserOnPto,
  getRandomQuip
}