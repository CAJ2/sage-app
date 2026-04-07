import java.io.File
import org.apache.tools.ant.taskdefs.condition.Os
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.logging.LogLevel
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

open class BuildTask : DefaultTask() {
    @Input
    var rootDirRel: String? = null
    @Input
    var target: String? = null
    @Input
    var release: Boolean? = null

    @TaskAction
    fun assemble() {
        val executable = resolvePnpm()
        try {
            runTauriCli(executable)
        } catch (e: Exception) {
            if (Os.isFamily(Os.FAMILY_WINDOWS)) {
                // Try different Windows-specific extensions
                val fallbacks = listOf(
                    "$executable.exe",
                    "$executable.cmd",
                    "$executable.bat",
                )
                
                var lastException: Exception = e
                for (fallback in fallbacks) {
                    try {
                        runTauriCli(fallback)
                        return
                    } catch (fallbackException: Exception) {
                        lastException = fallbackException
                    }
                }
                throw lastException
            } else {
                throw e;
            }
        }
    }

    /**
     * Resolves the pnpm executable path.
     *
     * Gradle subprocesses may be spawned with a restricted PATH that omits version
     * manager shim directories (e.g. Volta, nvm, fnm). We probe known locations so
     * the build works regardless of how pnpm was installed.
     */
    fun resolvePnpm(): String {
        val home = System.getProperty("user.home") ?: return "pnpm"
        val candidates = listOf(
            "$home/.volta/bin/pnpm",       // Volta
            "$home/.local/share/pnpm/pnpm", // standalone pnpm install script
            "/opt/homebrew/bin/pnpm",       // Homebrew (Apple Silicon)
            "/usr/local/bin/pnpm",          // Homebrew (Intel) / manual install
        )
        for (candidate in candidates) {
            if (File(candidate).canExecute()) {
                return candidate
            }
        }
        return "pnpm" // fall back to PATH lookup
    }

    fun runTauriCli(executable: String) {
        val rootDirRel = rootDirRel ?: throw GradleException("rootDirRel cannot be null")
        val target = target ?: throw GradleException("target cannot be null")
        val release = release ?: throw GradleException("release cannot be null")
        val args = listOf("exec", "tauri", "android", "android-studio-script");

        project.exec {
            workingDir(File(project.projectDir, rootDirRel))
            executable(executable)
            args(args)
            if (project.logger.isEnabled(LogLevel.DEBUG)) {
                args("-vv")
            } else if (project.logger.isEnabled(LogLevel.INFO)) {
                args("-v")
            }
            if (release) {
                args("--release")
            }
            args(listOf("--target", target))
        }.assertNormalExitValue()
    }
}