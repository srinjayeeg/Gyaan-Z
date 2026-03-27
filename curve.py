import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(1, 10, 100)

normal_ai = x
socratic_ai = x * np.log(x + 1)

# Plot
plt.figure()
plt.plot(x, normal_ai, label="Normal AI (Direct Answer)")
plt.plot(x, socratic_ai, label="Socratic AI (Guided Reasoning)")

# Labels
plt.xlabel("Question Complexity")
plt.ylabel("Response Quality")
plt.title("Normal AI vs Socratic AI Response Quality")

# Legend
plt.legend()

# Show
plt.show()