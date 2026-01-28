import pandas as pd
import numpy as np

# Example: historical foot traffic data
# data should have columns: 'date' and 'foot_traffic'
# df = pd.read_csv('foot_traffic.csv', parse_dates=['date'])
# For illustration, let's create a sample
dates = pd.date_range(start='2022-01-01', end='2025-01-01', freq='D')
foot_traffic = np.random.poisson(lam=100, size=len(dates))  # simulate foot traffic
df = pd.DataFrame({'date': dates, 'foot_traffic': foot_traffic})

# Set date as index
df.set_index('date', inplace=True)

# Day of the week (0=Monday, 6=Sunday)
df['day_of_week'] = df.index.dayofweek

# Previous week trend (mean foot traffic in previous 7 days)
df['prev_week_mean'] = df['foot_traffic'].shift(1).rolling(window=7).mean()

# Previous month trend (mean foot traffic in previous 30 days)
df['prev_month_mean'] = df['foot_traffic'].shift(1).rolling(window=30).mean()

# Previous year trend (mean foot traffic in previous 365 days)
df['prev_year_mean'] = df['foot_traffic'].shift(1).rolling(window=365).mean()

# Drop rows with NaN (first 365 days will have NaNs for year)
df = df.dropna()

from sklearn.model_selection import train_test_split

# Features
X = df[['day_of_week', 'prev_week_mean', 'prev_month_mean', 'prev_year_mean']]
y = df['foot_traffic']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f'RMSE: {rmse:.2f}')

# Forecast for the next 7 days
future_dates = pd.date_range(start=df.index[-1] + pd.Timedelta(days=1), periods=7, freq='D')
future_df = pd.DataFrame(index=future_dates)

# Generate features for future dates
future_df['day_of_week'] = future_df.index.dayofweek
future_df['prev_week_mean'] = df['foot_traffic'][-7:].mean()  # last 7 days
future_df['prev_month_mean'] = df['foot_traffic'][-30:].mean()  # last 30 days
future_df['prev_year_mean'] = df['foot_traffic'][-365:].mean()  # last 365 days

# Predict
future_df['predicted_foot_traffic'] = model.predict(future_df[['day_of_week', 'prev_week_mean', 'prev_month_mean', 'prev_year_mean']])
print(future_df[['predicted_foot_traffic']])
