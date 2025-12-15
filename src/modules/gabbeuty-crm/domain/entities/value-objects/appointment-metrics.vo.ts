export interface AppointmentMetricsProps {
  confirmed: number;
  pending: number;
  canceled: number;
  completed: number;
  invoicing: number;
}

export class AppointmentMetrics {
  private constructor(private props: AppointmentMetricsProps) {}

  static create(props: AppointmentMetricsProps): AppointmentMetrics {
    return new AppointmentMetrics(props);
  }

  get confirmed(): number {
    return this.props.confirmed;
  }

  get pending(): number {
    return this.props.pending;
  }

  get canceled(): number {
    return this.props.canceled;
  }

  get completed(): number {
    return this.props.completed;
  }

  get invoicing(): number {
    return this.props.invoicing;
  }

  get total(): number {
    return this.confirmed + this.pending + this.canceled + this.completed;
  }

  get completionRate(): number {
    const total = this.total;
    return total > 0 ? Math.round((this.completed / total) * 100) : 0;
  }

  get cancellationRate(): number {
    const total = this.total;
    return total > 0 ? Math.round((this.canceled / total) * 100) : 0;
  }
}
