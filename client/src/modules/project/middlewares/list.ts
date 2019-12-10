import {Dispatch} from 'redux';
import {AppState} from '../../../store/reducers';
import {loading, errors, success} from '../actions/list';
import errorFormater from '../../../utils/errorFormater';
import {Project} from '../models/Project';
import {ProjectFactory} from '../factory/ProjectFactory';

export const listProjects = () => async (
  dispatch: Dispatch,
  state: AppState,
  axios: any
): Promise<void> => {
  dispatch(loading(true));

  try {
    const response = await axios.get('projects');
    const projects: Project[] = [];

    for (const project of response.data) {
      projects.push(ProjectFactory.create(project));
    }

    dispatch(success(projects));
  } catch (e) {
    dispatch(errors(errorFormater(e)));
  } finally {
    dispatch(loading(false));
  }
};