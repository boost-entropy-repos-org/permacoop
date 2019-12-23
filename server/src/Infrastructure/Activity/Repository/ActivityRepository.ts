import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {IActivityRepository} from 'src/Domain/Activity/Repository/IActivityRepository';
import {Activity} from 'src/Domain/Activity/Activity.entity';
import {User} from 'src/Domain/User/User.entity';

@Injectable()
export class ActivityRepository implements IActivityRepository {
  constructor(
    @InjectRepository(Activity)
    private readonly repository: Repository<Activity>
  ) {}

  public save(activity: Activity): Promise<Activity> {
    return this.repository.save(activity);
  }

  public async getTimeSpentSumByUserAndDate(
    user: User,
    date: string
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('activity')
      .select('SUM(activity.time) as time')
      .where('activity.date = :date', {date})
      .andWhere('activity.user = :user', {user: user.getId()})
      .getRawOne();

    return Number(result.time) || 0;
  }

  public findOneById(id: string): Promise<Activity> {
    return this.repository
      .createQueryBuilder('activity')
      .select([
        'activity.id',
        'activity.date',
        'activity.time',
        'activity.summary',
        'project.id',
        'project.name',
        'task.id',
        'task.name'
      ])
      .where('activity.id = :id', {id})
      .innerJoin('activity.task', 'task')
      .innerJoin('activity.project', 'project')
      .getOne();
  }

  public findMonthlyActivitiesByUser(
    userId: string,
    date: string
  ): Promise<Activity[]> {
    const month = new Date(date).getMonth() + 1;
    const year = new Date(date).getFullYear();

    return this.repository
      .createQueryBuilder('activity')
      .select([
        'activity.id',
        'activity.time',
        'activity.summary',
        'activity.date',
        'project.id',
        'project.name',
        'customer.id',
        'customer.name',
        'task.id',
        'task.name'
      ])
      .where('user.id = :userId', {userId})
      .andWhere('extract(month FROM activity.date) = :month', {month})
      .andWhere('extract(year FROM activity.date) = :year', {year})
      .innerJoin('activity.task', 'task')
      .innerJoin('activity.project', 'project')
      .innerJoin('project.customer', 'customer')
      .innerJoin('activity.user', 'user')
      .orderBy('activity.date', 'ASC')
      .addOrderBy('activity.time', 'ASC')
      .getMany();
  }
}